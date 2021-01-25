# Bilibili_Anime4K_Experimental
Bring Anime4K filter to all the 2D anime you love on [Bilibili](https://www.bilibili.com/) and [ACFun](https://www.acfun.cn/)!

[[中文README]](README_zh.md)

# Usage
Load and enable Bilibili_Anime4K.js in your TamperMonkey and switch to HTML5 player. Tested on Chrome 77. Note that this should only be enabled on 2D anime since the filter just isn't fit for other type of videos.

The script will automatically scale video to 1440p resolution.

If you want to disable filter for some video just disable the script in your TamperMonekey (since I haven't made a control panel yet... PRs are welcome).

# Comparison on 360p
![Comparison](images/Comparison.png?raw=true)

I've updated the script with the latest version of Anime4K [Anime4K_Upscale_CNN_M_x2_Deblur](https://github.com/bloc97/Anime4K/blob/master/glsl/Upscale%2BDeblur/Anime4K_Upscale_CNN_M_x2_Deblur.glsl). Note that this version runs on a deep learning algorithm according to the original author, hence may cause your computer to by laggy while playing the anime.

FYI, I've uploaded the original screenshot of both in the "images" folder.

# Experimental features
- Support ACFun.

# Issues
- Even lagger than before.
- You can no longer click the video to pause it if you're on ACFun.

# Acknowledgements
This repository contains code from [Anime4K](https://github.com/bloc97/Anime4K) by [bloc97](https://github.com/bloc97).

Source code was released under MIT license.

2021, net2cn, made with ♥ of anime.