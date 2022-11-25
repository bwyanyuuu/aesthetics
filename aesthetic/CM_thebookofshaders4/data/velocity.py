import numpy as np
import cv2
img = np.array(cv2.imread('./CM_thebookofshaders4/data/MonaLisa-blur.jpg'))
print(img.shape)
window = 1
# for x in range(-window, window+1):
#     for y in range(-window, window+1):
#         print(x, y)
intensity = []
def rgb2i(rgb):
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]
def getIn(i, j):
    if intensity[i][j] != -1:
        return intensity[i][j]
    else:
        return rgb2i(img[i][j])

for i in range(img.shape[0]):
    intensity.append([])
    for j in range(img.shape[1]):
        intensity[i].append(-1)

out = np.zeros(img.shape)
for i in range(img.shape[0]):
    for j in range(img.shape[1]):
        c = getIn(i, j)
        vol = np.zeros((3,))
        cnt = 0
        # print(i, j)
        for x in range(-window, window+1):
            for y in range(-window, window+1):
                xx = i + x
                yy = j + y
                if xx < 0 or xx >= img.shape[0]:
                    continue
                if yy < 0 or yy >= img.shape[1]:
                    continue
                # print(xx, yy)
                c_vs = getIn(xx, yy)
                diff = c - c_vs # intensity difference
                # ++: 1.0, +-: 0.25, -+:0.5, --:0.
                vol += diff * np.array([abs(xx), abs(yy), 1+x*0.5+y*0.25])
                cnt += 1
        vol /= cnt
        out[i][j] = vol
cv2.imwrite("result2.jpg", out)

