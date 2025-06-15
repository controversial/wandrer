import marimo

__generated_with = "0.13.14"
app = marimo.App(width="medium")

with app.setup:
    import marimo as mo


@app.cell(hide_code=True)
def _():
    mo.md(
        """
    # 1. Map download

    Download the cycling network from OpenStreetMap using osmnx
    """
    )
    return


@app.cell
def _():
    _base_excludes = (
        '["area"!="yes"]'
        '["access"!="no"]'
        # no destroyed roads
        '[!"razed"][!"razed:highway"][!"demolished:highway"][!"removed:highway"]'
        # rail/water/indoor are inacccessible by bike
        '[!"railway"]'
        '[!"waterway"]'
        '["route"!="ferry"]'
        '["indoor"!="yes"]'
        # practically untraversable routes
        '["mtb:scale"!="6"]'
    )
    _excludes_ignoring_bicycle_tag = (
        # Exclude limited access roads
        '["access"!~"^(private|customers|military|delivery|emergency|no)$"]'
        # no big highways
        '["motorroad"!="yes"]'
        # exclude golf courses
        '["golf_cart"!~"^(yes|designated|private)$"]'
        # practically untraversable routes
        '["mtb:scale"!="6"]'
        # no tunnels - although this has some false positives for short tunnels that are
        # in fact part of bikeable roads
        # TODO: postprocess filter tunnels by length instead?
        # '["tunnel"!~"^(yes|building_passage)$"]'
    )
    _bicycle_tag_excludes = '["bicycle"!~"^(dismount|use_sidepath|private|no)$"]'
    excludes = _base_excludes + _excludes_ignoring_bicycle_tag + _bicycle_tag_excludes


    # 1. Start with road types that can be *assumed* to have bicycle access,
    #    unless otherwise specified.
    assumed_bike_access = [
        (
            '["highway"]'
            '["highway"!~"^(motorway|motorway_link|steps|stairs|escalator|elevator|construction|proposed|demolished|escape|bus_guideway|platform|elevator|raceway|rest_area|traffic_island|services|yes|no|razed|corridor|busway|via_ferrata)$"]'
            '["highway"!~"^(trunk|trunk_link|footway|service|bridleway)$"]'
            '["highway"!="pedestrian"]'
            f"{excludes}"
        ),
        ## **Named** service roads that don’t have a specific service=... tag
        f'["highway"="service"]["name"][!"service"]{excludes}',
    ]

    # 2. Add in ways that have bicycle access explicitly marked
    explicit_bike_access = [
        # Ways with allowed values in bicycle=... tags
        f'["highway"]["bicycle"~"^(yes|designated|permissive|official|mtb|MTB)$"]{_base_excludes}',
        # Ways with bicycle:designated... tags
        f'["highway"][~"^bicycle:designated.*$"~"."]{excludes}',
        # Ways with a `highway` tag of cycleway
        f'["highway"="cycleway"]{excludes}',
        # Ways marked with bicycle_road/cyclestreet
        f'["highway"][~"^(bicycle_road|cyclestreet)$"~"."]{excludes}',
        # Ways with `bicycle:no` but `bicycle:conditional`
        f'["highway"]["bicycle:conditional"~"^yes"]{_excludes_ignoring_bicycle_tag}',
        # Ways that are part of relations with route=bicycle
        # We do some Overpass query injection to query for relations
        # f'(1)(2);relation["route"="bicycle"]'
    ]

    bike_filter = assumed_bike_access + explicit_bike_access
    return (bike_filter,)


@app.cell
def _(bike_filter):
    import osmnx as ox
    import osmnx.settings

    osmnx.settings.useful_tags_way = ["name", "highway", "access", "oneway", "ref", "bicycle"]

    bike_network_directed = ox.simplify_graph(
        ox.graph_from_place(
            "Manhattan, New York, USA",
            custom_filter=bike_filter,
            simplify=False,
            retain_all=True,
            truncate_by_edge=True,
        ),
        edge_attrs_differ=["osmid"],
    )
    bike_network_undirected = ox.convert.to_undirected(bike_network_directed)
    return bike_network_undirected, ox


@app.cell
def _(bike_network_undirected, ox):
    ways_gdf = ox.convert.graph_to_gdfs(bike_network_undirected, nodes=False)
    ways_gdf["osmid"] = ways_gdf["osmid"].astype(str)
    ways_gdf = ways_gdf.set_index("osmid")
    ways_gdf
    return (ways_gdf,)


@app.cell
def _(ways_gdf):
    import leafmap.foliumap as leafmap

    network_map = leafmap.Map(tiles="CartoDB.DarkMatter")
    network_map.add_basemap("CartoDB.DarkMatter")
    network_map.add_gdf(
        ways_gdf.reset_index(),
        layer_name="Ways",
        info_mode="on_click",
        style={"color": "#ffffff", "weight": 2, "fill": False, "opacity": 0.5}
    )
    network_map
    return (leafmap,)


@app.cell(hide_code=True)
def _():
    mo.md("""# 2. GPS track""")
    return


@app.cell
def _():
    import fitparse
    import geopandas as gpd

    def load_track(path: str):
        fitfile = fitparse.FitFile(path)
        # TODO: split into multiple dataframes where there was a pause of more than a few seconds
        entries = gpd.GeoDataFrame(
            record.get_values()
            for record in fitfile.get_messages("record")
            if isinstance(record, fitparse.DataMessage)
        )
        entries["lat"] = entries["position_lat"] * (180 / 2**31)
        entries["lng"] = entries["position_long"] * (180 / 2**31)

        track = (
            entries.drop(columns=["position_lat", "position_long"])
            .set_geometry(gpd.points_from_xy(entries["lng"], entries["lat"]), crs="wgs84")
            .dropna(subset=["lat", "lng"])
            .drop(columns=["lat", "lng", "altitude"])
            .rename(columns={"enhanced_altitude": "altitude", "enhanced_speed": "speed"})
        )

        return track

    track = load_track("testdata/track2.fit")
    track
    return (track,)


@app.cell
def _(leafmap, track):
    import folium
    import shapely

    track_map = leafmap.Map(tiles="CartoDB.DarkMatter")
    track_map.add_gdf(track, marker=folium.CircleMarker(radius=5))
    track_linestring = shapely.geometry.LineString(track["geometry"])
    track_map.add_geojson(shapely.to_geojson(track_linestring), style={ "color": "#1e2" })
    track_map
    return


if __name__ == "__main__":
    app.run()
