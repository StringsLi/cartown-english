# 中国轮廓资源

用于儿童国家形状认知；台湾省和大陆、海南岛使用同一种颜色绘入同一张中国卡片。

几何来源：[Natural Earth](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson)。仅保留渲染所需坐标，合并为中国轮廓。Natural Earth 数据为[公有领域](https://www.naturalearthdata.com/about/terms-of-use/)。

运行 `SHARP_ROOT=/path/to/sharp node scripts/generate-china-map.cjs` 可重建 SVG 和小程序 PNG。经纬度按等距圆柱投影、经向乘 cos(35°)；轮廓是低分辨率形状示意，不用作导航或边界测量。
