from lifxlan import LifxLAN
from sys import argv

lan = LifxLAN()

name = argv[1]
hue, saturation, lightness = argv[2].split(',')
duration = argv[3]
hue = int(hue)
saturation = int(saturation)
lightness = int(lightness)
if hue <= 0:
    hue = 0
elif hue >= 65535:
    hue = 65535

if saturation <= 0:
    saturation = 0
elif saturation >= 65535:
    saturation = 65535

if lightness <= 0:
    lightness = 0
elif lightness >= 65535:
    lightness = 65535


light = lan.get_device_by_name(name)

light.set_power(1)

light.set_waveform(1, (hue, saturation, lightness, 3500),
                   int(duration) * 2, 1, -16000, 1)
