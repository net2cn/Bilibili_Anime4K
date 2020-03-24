# Bilibili_Anime4K
Bring Anime4K filter to all the 2D anime you love on [Bilibili](https://www.bilibili.com/)!

[[中文README]](README_zh.md)

# Usage
Load and enable Bilibili_Anime4K.js in your TamperMonkey and switch to HTML5 player. Tested on Chrome 77. Note that this should only be enabled on 2D anime since the filter just isn't fit for other type of videos.

The script will automatically scale video to 1440p resolution.

If you want to disable filter for some video just disable the script in your TamperMonekey (since I haven't made a control panel yet... PRs are welcome).

# Comparison on 360p
![Comparison](images/Comparison.png?raw=true)

Actually it is just a filter, not a super-resolution algorithm, so don't have a super high expectaion on super-low resolution like 360p. However, if you are running 720p or higher it actually would have a better viewer experience with sharper lines and colors (and of course, lagging your computer).

FYI, I've uploaded the original screenshot of both in the "images" folder.

# Experimental features
- Support more sites (like ACFun, whatever. Add @match if you want to try out).
- Not keeping video aspect ratio.

# Issues
- Even lagger than before.

# Acknowledgements
This repository contains code from [Anime4K](https://github.com/bloc97/Anime4K) by [bloc97](https://github.com/bloc97).

Source code was released under MIT license.

2020, net2cn, made with ♥ of anime.