# Bilibili_Anime4K
Bring Anime4K filter to all the animes you love on [Bilibili](https://www.bilibili.com/)!

[[中文README]](README_zh.md)

# Usage
Load and enable Bilibili_Anime4K.js in your TamperMonkey. Chrome 77 tested.

If you want to disable filter for some video just disable the script in your TamperMonekey (since I haven't made a control panel yet... PRs are welcome).

# Comparison on 360p
![Comparison](images/Comparison.png?raw=true)

Actually it is just a filter, not a super-resolution algorithm, so don't have a super high expectaion on super-low resolution like 360p. However, if you are running 720p or higher it actually would have a better viewer experience with sharper lines and colors (and of course, lagging your computer).

FYI, I've uploaded the original screenshot of both in the "images" folder.

# TODO
- Add controls of the filter.
- Update WebGL implementation to GLSL implementation RC 1.0.
- Fix video cannot be found in animes that need VIP. (Actually I don't think this is needed since you can always enable 1080p+ if you are VIP, and other kids like me who has no VIP cannot watch these animes, haha.)
- Support more sites (like ACFun, whatever).

# Issues
- It seems that we can't find video tag when the anime need VIP, but don't worry, it will fallback automatically.
- It would be dramatically slow if you set scale to 2.0 while watching 1080p resolution on laptops.

# Acknowledgements
This repository contains code from [Anime4K](https://github.com/bloc97/Anime4K) by [bloc97](https://github.com/bloc97).

2019, net2cn, made with ♥ of anime.