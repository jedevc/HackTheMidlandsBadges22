export const defaultProgram = `
title = "{user}"
content = "Hello I am {user}!"

banner = [[
#     # ####### #     #
#     #    #    ##   ##
#     #    #    # # # #
#######    #    #  #  #
#     #    #    #     #
#     #    #    #     #
#     #    #    #     #
]]

-- render the rainbow background
k = (k or 0) + 1
for i=1,image_width do
  for j=1,image_height do
    x = (i + j + k) % 100
    image[i][j] = hsl(x / 100, 0.7, 0.5)
  end
end

-- render the banner
banner_width = 0
banner_height = 0
banner_lines = {}
for line in string.gmatch(banner, "[^\\r\\n]+") do
  banner_width = math.max(banner_width, #line)
  banner_height = banner_height + 1
  banner_lines[banner_height] = {}
  for i=0,#line do
    banner_lines[banner_height][i] = string.sub(line, i, i)
  end
end
x = (image_width - banner_width) // 2
y = (image_height - banner_height) // 2 + 2
for i=1,banner_width do
  for j=1,banner_height do
    if banner_lines[j][i] == "#" then
      image[x + i][y + j] = hsl(0, 1.0, 1.0)
    end
  end
end
`.trim();
