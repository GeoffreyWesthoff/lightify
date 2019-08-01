from yeelight import Bulb, Flow, transitions
from sys import argv

ip = argv[1]
red, green, blue = argv[2].split(',')
duration = int(argv[3])
if argv[4] == 'false':
    auto_on = False
else:
    auto_on = True
brightness = int(argv[5])

desk = Bulb(ip, effect='sudden', auto_on=auto_on)


flow = Flow(
    count=1,
    transitions=transitions.pulse(int(red), int(green), int(blue),
                                  duration=duration, brightness=brightness)
)

desk.start_flow(flow)
