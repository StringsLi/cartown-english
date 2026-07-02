Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$vehicleDir = Join-Path $root "static/topic-icons/vehicles"
$mapDir = Join-Path $root "static/topic-icons/maps"
$flagDir = Join-Path $root "static/topic-icons/flags"
New-Item -ItemType Directory -Force -Path $vehicleDir, $mapDir, $flagDir | Out-Null

function New-IconColor($hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function New-IconBrush($hex) {
  return [System.Drawing.SolidBrush]::new((New-IconColor $hex))
}

function New-IconPen($hex, $width = 4) {
  $p = [System.Drawing.Pen]::new((New-IconColor $hex), $width)
  $p.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $p.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $p.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  return $p
}

function Fill-RoundRect($g, $brush, $x, $y, $w, $h, $r) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function Stroke-RoundRect($g, $pen, $x, $y, $w, $h, $r) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $g.DrawPath($pen, $path)
  $path.Dispose()
}

function Save-Icon($path, [scriptblock]$draw) {
  $bmp = [System.Drawing.Bitmap]::new(320, 240)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)
  & $draw $g
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

function Draw-Wheel($g, $x, $y, $size = 34) {
  $g.FillEllipse((New-IconBrush "#243431"), $x, $y, $size, $size)
  $pad = [int]($size * 0.28)
  $g.FillEllipse((New-IconBrush "#dfeee7"), $x + $pad, $y + $pad, $size - $pad * 2, $size - $pad * 2)
}

function Draw-BaseVehicle($g, $body = "#8fb9ae", $accent = "#e8c96f", $kind = "car") {
  Fill-RoundRect $g (New-IconBrush $body) 46 100 222 62 22
  if ($kind -eq "bus") {
    Fill-RoundRect $g (New-IconBrush $body) 44 74 232 88 22
    foreach ($x in 72, 118, 164, 210) {
      Fill-RoundRect $g (New-IconBrush "#f5f7f2") $x 90 34 28 8
    }
  } elseif ($kind -eq "truck") {
    Fill-RoundRect $g (New-IconBrush $body) 42 96 146 66 16
    Fill-RoundRect $g (New-IconBrush $accent) 188 78 82 84 14
    Fill-RoundRect $g (New-IconBrush "#f5f7f2") 205 94 36 28 7
  } else {
    $roof = [System.Drawing.Point[]]@(
      [System.Drawing.Point]::new(92, 100),
      [System.Drawing.Point]::new(128, 66),
      [System.Drawing.Point]::new(196, 66),
      [System.Drawing.Point]::new(232, 100)
    )
    $g.FillPolygon((New-IconBrush $body), $roof)
    Fill-RoundRect $g (New-IconBrush "#f5f7f2") 130 78 56 25 7
  }
  Fill-RoundRect $g (New-IconBrush $accent) 56 116 34 14 7
  Draw-Wheel $g 78 150
  Draw-Wheel $g 208 150
}

$vehicles = @{
  "car" = { param($g) Draw-BaseVehicle $g "#8fb9ae" "#e8c96f" "car" }
  "bus" = { param($g) Draw-BaseVehicle $g "#9bbfb4" "#e8c96f" "bus" }
  "taxi" = { param($g) Draw-BaseVehicle $g "#e8c96f" "#3f6f67" "car"; Fill-RoundRect $g (New-IconBrush "#243431") 138 52 48 18 6 }
  "truck" = { param($g) Draw-BaseVehicle $g "#9bbfb4" "#cf8f78" "truck" }
  "school-bus" = { param($g) Draw-BaseVehicle $g "#e8c96f" "#3f6f67" "bus" }
  "fire-truck" = { param($g) Draw-BaseVehicle $g "#cf8f78" "#e8c96f" "truck"; $g.DrawLine((New-IconPen "#f5f7f2" 8), 74, 86, 174, 86) }
  "ambulance" = { param($g) Draw-BaseVehicle $g "#f5f7f2" "#cf8f78" "truck"; $g.FillRectangle((New-IconBrush "#cf8f78"), 88, 116, 42, 12); $g.FillRectangle((New-IconBrush "#cf8f78"), 103, 101, 12, 42) }
  "police-car" = { param($g) Draw-BaseVehicle $g "#d4e2de" "#3f6f67" "car"; Fill-RoundRect $g (New-IconBrush "#cf8f78") 142 54 36 16 5 }
  "garbage-truck" = { param($g) Draw-BaseVehicle $g "#6f9d91" "#dfeee7" "truck"; $g.DrawArc((New-IconPen "#f5f7f2" 6), 82, 84, 64, 44, 20, 260) }
  "tow-truck" = { param($g) Draw-BaseVehicle $g "#9bbfb4" "#e8c96f" "truck"; $g.DrawLine((New-IconPen "#3f6f67" 8), 190, 82, 252, 46); $g.DrawLine((New-IconPen "#3f6f67" 6), 252, 46, 252, 80) }
  "train" = {
    param($g)
    Fill-RoundRect $g (New-IconBrush "#8fb9ae") 42 72 232 88 18
    Fill-RoundRect $g (New-IconBrush "#3f6f67") 226 58 36 102 12
    foreach ($x in 68, 112, 156, 200) { Fill-RoundRect $g (New-IconBrush "#f5f7f2") $x 90 30 28 7 }
    Draw-Wheel $g 74 150 30; Draw-Wheel $g 140 150 30; Draw-Wheel $g 206 150 30
  }
  "bicycle" = {
    param($g)
    Draw-Wheel $g 62 136 54; Draw-Wheel $g 202 136 54
    $p = New-IconPen "#3f6f67" 9
    $g.DrawLine($p, 89, 162, 145, 112)
    $g.DrawLine($p, 145, 112, 228, 162)
    $g.DrawLine($p, 89, 162, 166, 162)
    $g.DrawLine($p, 166, 162, 145, 112)
    $g.DrawLine($p, 145, 112, 134, 84)
    $g.DrawLine($p, 206, 96, 228, 162)
    $g.DrawLine($p, 196, 96, 226, 96)
  }
  "motorcycle" = {
    param($g)
    Draw-Wheel $g 58 140 50; Draw-Wheel $g 208 140 50
    Fill-RoundRect $g (New-IconBrush "#8fb9ae") 104 112 96 44 18
    $g.DrawLine((New-IconPen "#3f6f67" 8), 184, 118, 222, 82)
    $g.DrawLine((New-IconPen "#3f6f67" 8), 112, 114, 80, 92)
  }
  "scooter" = {
    param($g)
    Draw-Wheel $g 88 154 34; Draw-Wheel $g 210 154 34
    $p = New-IconPen "#3f6f67" 9
    $g.DrawLine($p, 104, 170, 222, 170)
    $g.DrawLine($p, 218, 170, 198, 88)
    $g.DrawLine($p, 188, 88, 226, 88)
  }
  "excavator" = {
    param($g)
    Fill-RoundRect $g (New-IconBrush "#3f6f67") 54 158 150 32 14
    Fill-RoundRect $g (New-IconBrush "#e8c96f") 84 96 82 64 16
    Fill-RoundRect $g (New-IconBrush "#f5f7f2") 108 108 30 28 6
    $p = New-IconPen "#e8c96f" 13
    $g.DrawLine($p, 160, 102, 224, 58)
    $g.DrawLine($p, 224, 58, 266, 126)
    $g.FillPie((New-IconBrush "#cf8f78"), 238, 118, 58, 44, 10, 160)
  }
  "bulldozer" = {
    param($g)
    Fill-RoundRect $g (New-IconBrush "#3f6f67") 58 156 142 32 14
    Fill-RoundRect $g (New-IconBrush "#e8c96f") 76 96 90 62 16
    Fill-RoundRect $g (New-IconBrush "#f5f7f2") 108 108 34 28 6
    $blade = [System.Drawing.Point[]]@([System.Drawing.Point]::new(190, 126), [System.Drawing.Point]::new(280, 94), [System.Drawing.Point]::new(280, 166), [System.Drawing.Point]::new(190, 154))
    $g.FillPolygon((New-IconBrush "#cf8f78"), $blade)
  }
  "crane" = {
    param($g)
    Draw-BaseVehicle $g "#9bbfb4" "#e8c96f" "truck"
    $p = New-IconPen "#3f6f67" 8
    $g.DrawLine($p, 136, 92, 136, 30)
    $g.DrawLine($p, 136, 34, 254, 64)
    $g.DrawLine($p, 254, 64, 254, 104)
    Fill-RoundRect $g (New-IconBrush "#cf8f78") 242 104 24 22 6
  }
  "dump-truck" = {
    param($g)
    Fill-RoundRect $g (New-IconBrush "#3f6f67") 190 94 72 68 14
    $bed = [System.Drawing.Point[]]@([System.Drawing.Point]::new(48, 112), [System.Drawing.Point]::new(178, 78), [System.Drawing.Point]::new(198, 146), [System.Drawing.Point]::new(62, 160))
    $g.FillPolygon((New-IconBrush "#e8c96f"), $bed)
    Fill-RoundRect $g (New-IconBrush "#f5f7f2") 207 108 30 24 6
    Draw-Wheel $g 82 150; Draw-Wheel $g 212 150
  }
  "cement-mixer" = {
    param($g)
    Draw-BaseVehicle $g "#9bbfb4" "#e8c96f" "truck"
    $g.FillEllipse((New-IconBrush "#dfeee7"), 74, 78, 112, 72)
    $g.DrawEllipse((New-IconPen "#3f6f67" 6), 74, 78, 112, 72)
    $g.DrawLine((New-IconPen "#3f6f67" 6), 92, 136, 166, 86)
  }
  "tractor" = {
    param($g)
    Draw-Wheel $g 62 128 70; Draw-Wheel $g 202 150 38
    Fill-RoundRect $g (New-IconBrush "#8fb9ae") 122 106 92 48 14
    Fill-RoundRect $g (New-IconBrush "#e8c96f") 102 70 56 50 12
    Fill-RoundRect $g (New-IconBrush "#f5f7f2") 114 82 28 24 5
  }
  "road-roller" = {
    param($g)
    $g.FillEllipse((New-IconBrush "#d4e2de"), 44, 124, 92, 74)
    $g.DrawEllipse((New-IconPen "#3f6f67" 6), 44, 124, 92, 74)
    Fill-RoundRect $g (New-IconBrush "#e8c96f") 128 92 104 68 16
    Fill-RoundRect $g (New-IconBrush "#f5f7f2") 150 104 34 28 6
    Draw-Wheel $g 220 154 34
  }
  "forklift" = {
    param($g)
    Draw-Wheel $g 86 150 34; Draw-Wheel $g 178 150 34
    Fill-RoundRect $g (New-IconBrush "#e8c96f") 82 100 110 60 16
    Fill-RoundRect $g (New-IconBrush "#f5f7f2") 116 112 28 24 6
    $p = New-IconPen "#3f6f67" 8
    $g.DrawLine($p, 220, 62, 220, 170)
    $g.DrawLine($p, 220, 170, 284, 170)
    $g.DrawLine($p, 220, 148, 272, 148)
  }
}

foreach ($name in $vehicles.Keys) {
  Save-Icon (Join-Path $vehicleDir "$name.png") $vehicles[$name]
}

function Draw-MapFold($g) {
  Fill-RoundRect $g (New-IconBrush "#fffef9") 54 48 212 142 18
  Stroke-RoundRect $g (New-IconPen "#8fb9ae" 5) 54 48 212 142 18
  $g.DrawLine((New-IconPen "#d4e2de" 5), 124, 56, 110, 184)
  $g.DrawLine((New-IconPen "#d4e2de" 5), 194, 56, 208, 184)
  $g.DrawLine((New-IconPen "#3f6f67" 7), 78, 128, 116, 100)
  $g.DrawLine((New-IconPen "#3f6f67" 7), 116, 100, 158, 118)
  $g.DrawLine((New-IconPen "#3f6f67" 7), 158, 118, 224, 82)
  $g.FillEllipse((New-IconBrush "#cf8f78"), 216, 74, 22, 22)
}

function Draw-Globe($g) {
  $g.FillEllipse((New-IconBrush "#dfeee7"), 62, 32, 196, 196)
  $g.DrawEllipse((New-IconPen "#8fb9ae" 6), 62, 32, 196, 196)
  $g.DrawArc((New-IconPen "#3f6f67" 5), 92, 58, 62, 48, 180, 210)
  $g.FillEllipse((New-IconBrush "#8fb9ae"), 92, 70, 72, 38)
  $g.FillEllipse((New-IconBrush "#8fb9ae"), 154, 116, 70, 42)
  $g.FillEllipse((New-IconBrush "#8fb9ae"), 106, 164, 84, 34)
}

$maps = @{
  "map" = { param($g) Draw-MapFold $g }
  "world-map" = { param($g) Draw-MapFold $g; $g.FillEllipse((New-IconBrush "#e8c96f"), 38, 34, 38, 38) }
  "globe" = { param($g) Draw-Globe $g }
  "world" = { param($g) Draw-Globe $g }
  "country" = { param($g) Draw-MapFold $g; Fill-RoundRect $g (New-IconBrush "#e8c96f") 142 96 74 42 12 }
  "flag" = {
    param($g)
    $g.DrawLine((New-IconPen "#3f6f67" 9), 92, 48, 92, 192)
    Fill-RoundRect $g (New-IconBrush "#cf8f78") 98 54 136 72 10
    $g.FillRectangle((New-IconBrush "#e8c96f"), 98, 82, 136, 16)
  }
  "compass" = {
    param($g)
    $g.FillEllipse((New-IconBrush "#fffef9"), 68, 28, 184, 184)
    $g.DrawEllipse((New-IconPen "#8fb9ae" 7), 68, 28, 184, 184)
    $north = [System.Drawing.Point[]]@([System.Drawing.Point]::new(160, 52), [System.Drawing.Point]::new(184, 128), [System.Drawing.Point]::new(160, 116), [System.Drawing.Point]::new(136, 128))
    $south = [System.Drawing.Point[]]@([System.Drawing.Point]::new(160, 188), [System.Drawing.Point]::new(136, 112), [System.Drawing.Point]::new(160, 124), [System.Drawing.Point]::new(184, 112))
    $g.FillPolygon((New-IconBrush "#cf8f78"), $north)
    $g.FillPolygon((New-IconBrush "#3f6f67"), $south)
  }
  "continent" = {
    param($g)
    Draw-Globe $g
    $g.FillEllipse((New-IconBrush "#3f6f67"), 96, 68, 92, 70)
    $g.FillEllipse((New-IconBrush "#3f6f67"), 154, 126, 56, 72)
  }
  "ocean" = {
    param($g)
    Fill-RoundRect $g (New-IconBrush "#d4e2de") 42 72 236 104 28
    $g.DrawArc((New-IconPen "#3f6f67" 7), 60, 106, 72, 36, 0, 180)
    $g.DrawArc((New-IconPen "#3f6f67" 7), 122, 106, 72, 36, 0, 180)
    $g.DrawArc((New-IconPen "#3f6f67" 7), 184, 106, 72, 36, 0, 180)
  }
  "river" = {
    param($g)
    Draw-MapFold $g
    $g.DrawBezier((New-IconPen "#3f6f67" 9), 82, 76, 154, 112, 134, 142, 238, 174)
  }
  "mountain" = {
    param($g)
    $m1 = [System.Drawing.Point[]]@([System.Drawing.Point]::new(58, 178), [System.Drawing.Point]::new(136, 58), [System.Drawing.Point]::new(212, 178))
    $m2 = [System.Drawing.Point[]]@([System.Drawing.Point]::new(138, 178), [System.Drawing.Point]::new(202, 88), [System.Drawing.Point]::new(270, 178))
    $g.FillPolygon((New-IconBrush "#8fb9ae"), $m1)
    $g.FillPolygon((New-IconBrush "#d4e2de"), $m2)
    $g.FillPolygon((New-IconBrush "#fffef9"), [System.Drawing.Point[]]@([System.Drawing.Point]::new(116, 88), [System.Drawing.Point]::new(136, 58), [System.Drawing.Point]::new(156, 88)))
  }
  "city" = {
    param($g)
    Fill-RoundRect $g (New-IconBrush "#8fb9ae") 76 82 48 104 8
    Fill-RoundRect $g (New-IconBrush "#d4e2de") 136 54 58 132 8
    Fill-RoundRect $g (New-IconBrush "#e8c96f") 206 104 42 82 8
    foreach ($x in 92, 152, 172, 222) {
      foreach ($y in 102, 128, 154) { $g.FillRectangle((New-IconBrush "#fffef9"), $x, $y, 12, 12) }
    }
  }
}

foreach ($name in $maps.Keys) {
  Save-Icon (Join-Path $mapDir "$name.png") $maps[$name]
}

function Save-Flag($name, [scriptblock]$flagDraw) {
  $drawFlag = $flagDraw.GetNewClosure()
  Save-Icon (Join-Path $flagDir "$name.png") {
    param($g)
    Fill-RoundRect $g (New-IconBrush "#fffef9") 42 66 236 122 20
    Stroke-RoundRect $g (New-IconPen "#d4e2de" 4) 42 66 236 122 20
    $state = $g.Save()
    $clip = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $clip.AddRectangle([System.Drawing.Rectangle]::new(52, 76, 216, 102))
    $g.SetClip($clip)
    & $drawFlag $g
    $g.Restore($state)
    $clip.Dispose()
  }.GetNewClosure()
}

Save-Flag "china" { param($g) $g.FillRectangle((New-IconBrush "#cf8f78"), 52, 76, 216, 102); $g.FillEllipse((New-IconBrush "#e8c96f"), 74, 94, 32, 32) }
Save-Flag "united-states" { param($g) for ($i=0; $i -lt 7; $i++) { $g.FillRectangle((New-IconBrush "#cf8f78"), 52, 76 + $i * 16, 216, 8) }; $g.FillRectangle((New-IconBrush "#3f6f67"), 52, 76, 88, 56) }
Save-Flag "united-kingdom" { param($g) $g.FillRectangle((New-IconBrush "#3f6f67"), 52, 76, 216, 102); $g.DrawLine((New-IconPen "#fffef9" 18), 52, 76, 268, 178); $g.DrawLine((New-IconPen "#fffef9" 18), 268, 76, 52, 178); $g.DrawLine((New-IconPen "#cf8f78" 9), 52, 76, 268, 178); $g.DrawLine((New-IconPen "#cf8f78" 9), 268, 76, 52, 178); $g.FillRectangle((New-IconBrush "#fffef9"), 142, 76, 36, 102); $g.FillRectangle((New-IconBrush "#fffef9"), 52, 110, 216, 34); $g.FillRectangle((New-IconBrush "#cf8f78"), 152, 76, 16, 102); $g.FillRectangle((New-IconBrush "#cf8f78"), 52, 119, 216, 16) }
Save-Flag "canada" { param($g) $g.FillRectangle((New-IconBrush "#cf8f78"), 52, 76, 50, 102); $g.FillRectangle((New-IconBrush "#fffef9"), 102, 76, 116, 102); $g.FillRectangle((New-IconBrush "#cf8f78"), 218, 76, 50, 102); $g.FillEllipse((New-IconBrush "#cf8f78"), 142, 106, 36, 44) }
Save-Flag "australia" { param($g) $g.FillRectangle((New-IconBrush "#3f6f67"), 52, 76, 216, 102); $g.FillEllipse((New-IconBrush "#fffef9"), 206, 110, 20, 20); $g.FillEllipse((New-IconBrush "#fffef9"), 232, 142, 14, 14); $g.FillRectangle((New-IconBrush "#d4e2de"), 52, 76, 80, 48) }
Save-Flag "japan" { param($g) $g.FillRectangle((New-IconBrush "#fffef9"), 52, 76, 216, 102); $g.FillEllipse((New-IconBrush "#cf8f78"), 132, 94, 56, 56) }
Save-Flag "france" { param($g) $g.FillRectangle((New-IconBrush "#3f6f67"), 52, 76, 72, 102); $g.FillRectangle((New-IconBrush "#fffef9"), 124, 76, 72, 102); $g.FillRectangle((New-IconBrush "#cf8f78"), 196, 76, 72, 102) }
Save-Flag "germany" { param($g) $g.FillRectangle((New-IconBrush "#243431"), 52, 76, 216, 34); $g.FillRectangle((New-IconBrush "#cf8f78"), 52, 110, 216, 34); $g.FillRectangle((New-IconBrush "#e8c96f"), 52, 144, 216, 34) }
Save-Flag "brazil" { param($g) $g.FillRectangle((New-IconBrush "#8fb9ae"), 52, 76, 216, 102); $diamond = [System.Drawing.Point[]]@([System.Drawing.Point]::new(160, 86), [System.Drawing.Point]::new(244, 127), [System.Drawing.Point]::new(160, 168), [System.Drawing.Point]::new(76, 127)); $g.FillPolygon((New-IconBrush "#e8c96f"), $diamond); $g.FillEllipse((New-IconBrush "#3f6f67"), 132, 100, 56, 56) }
Save-Flag "india" { param($g) $g.FillRectangle((New-IconBrush "#cf8f78"), 52, 76, 216, 34); $g.FillRectangle((New-IconBrush "#fffef9"), 52, 110, 216, 34); $g.FillRectangle((New-IconBrush "#8fb9ae"), 52, 144, 216, 34); $g.DrawEllipse((New-IconPen "#3f6f67" 4), 148, 114, 24, 24) }
Save-Flag "egypt" { param($g) $g.FillRectangle((New-IconBrush "#cf8f78"), 52, 76, 216, 34); $g.FillRectangle((New-IconBrush "#fffef9"), 52, 110, 216, 34); $g.FillRectangle((New-IconBrush "#243431"), 52, 144, 216, 34); $g.FillEllipse((New-IconBrush "#e8c96f"), 148, 114, 24, 24) }
Save-Flag "mexico" { param($g) $g.FillRectangle((New-IconBrush "#8fb9ae"), 52, 76, 72, 102); $g.FillRectangle((New-IconBrush "#fffef9"), 124, 76, 72, 102); $g.FillRectangle((New-IconBrush "#cf8f78"), 196, 76, 72, 102); $g.FillEllipse((New-IconBrush "#e8c96f"), 148, 114, 24, 24) }
Save-Flag "italy" { param($g) $g.FillRectangle((New-IconBrush "#8fb9ae"), 52, 76, 72, 102); $g.FillRectangle((New-IconBrush "#fffef9"), 124, 76, 72, 102); $g.FillRectangle((New-IconBrush "#cf8f78"), 196, 76, 72, 102) }
Save-Flag "spain" { param($g) $g.FillRectangle((New-IconBrush "#cf8f78"), 52, 76, 216, 26); $g.FillRectangle((New-IconBrush "#e8c96f"), 52, 102, 216, 50); $g.FillRectangle((New-IconBrush "#cf8f78"), 52, 152, 216, 26) }

Write-Output "Generated topic icons in static/topic-icons"


