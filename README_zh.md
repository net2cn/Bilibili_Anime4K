# Bilibili_Anime4K_Experimental
通过Anime4K滤镜让[Bilibili](https://www.bilibili.com/)与[ACFun](https://www.acfun.cn/)上的2D番剧更加锐利!

[[English README]](README.md)

# 用法
在TamperMonkey拓展中安装并启用该脚本，然后启用Bilibili的HTML5播放器。已在Chrome 77上通过测试。你最好只在2D番剧上启用这个脚本，因为这个算法单纯是为了2D番剧设计的。

目前会将视频自动放大到1440p。

如果你想为某些视频关闭滤镜直接在TamperMonkey拓展里面关掉脚本就好（因为我还没有写控制面板……欢迎发PR）。

# 360p分辨率上的对比
![对比](images/Comparison.png?raw=true)

我更新了内置的滤镜着色器，使其与Anime4K官方的[Anime4K_Upscale_CNN_M_x2_Deblur](https://github.com/bloc97/Anime4K/blob/master/glsl/Upscale%2BDeblur/Anime4K_Upscale_CNN_M_x2_Deblur.glsl)版本相同。根据原作者的介绍这个版本基于深度学习算法，有可能导致你的计算机在播放动画时卡顿。

对了，我在images文件夹里上传了原始的未开滤镜和开滤镜的截图。

# 实验性功能
- 支持ACFun。

# 已知Bug
- 更卡了。
- 在ACFun上不能点击视频暂停了。

# 声明
这个仓库包含来自由[bloc97](https://github.com/bloc97)共享的[Anime4K](https://github.com/bloc97/Anime4K)仓库的代码。

源代码在MIT协议下开放。

2021, net2cn, 用♥发电.