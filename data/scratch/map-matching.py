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

        # TODO: convert timestamp from string to datetime
        # TODO: sort by timestamp

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
    return folium, shapely


@app.cell(hide_code=True)
def _():
    mo.md(r"""# 3. Matching GPS track to street network""")
    return


@app.cell
def _(track):
    from pyproj import Transformer

    crs = track.estimate_utm_crs()

    transformer_to_meters = Transformer.from_crs("wgs84", crs, always_xy=True)
    transformer_to_latlng = Transformer.from_crs(crs, "wgs84", always_xy=True)

    crs
    return crs, transformer_to_latlng


@app.cell
def _(crs, track, ways_gdf):
    ways_gdf_proj = ways_gdf.to_crs(crs)
    track_proj = track.to_crs(crs)
    return track_proj, ways_gdf_proj


@app.cell
def _(shapely, track_proj, ways_gdf_proj):
    import pandas as pd
    import numpy as np

    def get_ways_for_point(
        point_proj: shapely.Point,
        radius: int,
    ):
        # Find all ways that intersect within radius of point
        matched_ways = ways_gdf_proj.iloc[ways_gdf_proj["geometry"].sindex.query(
            point_proj,
            predicate="dwithin",
            distance=radius,
        )]
        # compute distance to each
        def get_match_geom(way_geom):
            shortest_line = shapely.shortest_line(a=point_proj, b=way_geom)
            matched_point = shapely.Point(shortest_line.coords[1])
            return pd.Series({
                "matched_point": matched_point,
                "distance_from_search": shapely.length(shortest_line),
                "distance_along_way": shapely.line_locate_point(way_geom, matched_point, normalized=True)
            })

    
        if len(matched_ways):
            return matched_ways.join(matched_ways["geometry"].apply(get_match_geom))
        return matched_ways


    # Example
    point_1 = track_proj.iloc[0]["geometry"]
    matched_ways_1 = get_ways_for_point(point_1, 30)
    matched_ways_1
    return get_ways_for_point, matched_ways_1, point_1


@app.cell
def _(
    folium,
    leafmap,
    matched_ways_1,
    point_1,
    shapely,
    transformer_to_latlng,
):
    # example visualization
    matched_ways_map = leafmap.Map(tiles="CartoDB.DarkMatter")
    # plot original point
    matched_ways_map.add_marker(transformer_to_latlng.transform(point_1.x, point_1.y)[::-1])
    # plot “matched points” on matched ways
    matched_point_df = matched_ways_1.set_geometry("matched_point", crs=matched_ways_1.crs)[["matched_point"]]
    matched_ways_map.add_gdf(matched_point_df, marker=folium.CircleMarker(radius=5), style={"color": "red"})
    # plot dotted lines between original point and matched points
    matched_ways_map.add_gdf(
        matched_point_df["matched_point"].apply(lambda point_2: shapely.LineString([point_1, point_2])).to_frame(),
        style={ "color": "red", "dashArray": "5" }
    )
    matched_ways_map.add_gdf(matched_ways_1[["geometry"]])

    matched_ways_map
    return


@app.cell
def _(get_ways_for_point, track_proj):
    # At every point on the graph there are one or more possible “matches”
    #   - the closest point along zero or more matched ways
    #   - the track point itself, ie no match at all—“leaving” the street network.

    WAY_SEARCH_DISTANCE = 50  # meters

    nodes_for_track_points = {
        # track_point_index -> [
        #   { "point": POINT(x, y), "way": way_id, "distance_from_track": d },
        #   { "point": POINT(x, y), "way": None, "distance_from_track": 0 },
        # ]
    }


    for idx, track_entry in track_proj.iterrows():
        nodes_here = []

        # the track point itself, “free” (unconstrained) from the street network—
        # this means “leaving” the street network
        # this is needed, for example, to accurately match routes that “cut across”
        nodes_here.append({
            "point": track_entry["geometry"],
            "way": None,
            "distance_from_track": 0,
        })

        # candidate points on the street network
        for (osmid, match) in get_ways_for_point(track_entry["geometry"], WAY_SEARCH_DISTANCE).iterrows():
            nodes_here.append({
                "point": match["matched_point"],
                "way": osmid,
                "way_position": match["distance_along_way"],
                "distance_from_track": match["distance_from_search"],
            })

        nodes_for_track_points[idx] = nodes_here

    # sample: first 10 entries
    for i, (k, v) in enumerate(nodes_for_track_points.items()):
        if i >= 20: break
        print(f"{k}:")
        for node in v:
            print("  -", node)
    return


if __name__ == "__main__":
    app.run()
