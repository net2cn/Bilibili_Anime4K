# Bilibili_Anime4K
通过Anime4K滤镜让[Bilibili](https://www.bilibili.com/)上的2D番剧更加锐利!

[[English README]](README.md)

# 用法
在TamperMonkey拓展中安装并启用该脚本，然后启用Bilibili的HTML5播放器。已在Chrome 77上通过测试。你最好只在2D番剧上启用这个脚本，因为这个算法单纯是为了2D番剧设计的

如果你想为某些视频关闭滤镜直接在TamperMonkey拓展里面关掉脚本就好（因为我还没有写控制面板……欢迎发PR）。

# 360p分辨率上的对比
![对比](images/Comparison.png?raw=true)

Anime4K相较来说更像是滤镜而不是超分辨率算法，所以不要对它在超低的如360p的分辨率上有过高的预期。不过，如果你正在观看720p或者更高的分辨率的话，实际上会有更好的体验，因为线和色块的边缘变得更加锐利了（而且当然会让你的电脑变卡）。

对了，我在images文件夹里上传了原始的未开滤镜和开滤镜的截图。

# 将要实现的功能
- 根据分辨率自动切换放大倍率
- 支持更多的站点（比如ACFun啥的）。

# 已知Bug
- 当你设置scale为2.0或更高同时观看1080p视频时，会变得特别卡，特别是在笔记本上。

# 声明
这个仓库包含来自由[bloc97](https://github.com/bloc97)共享的[Anime4K](https://github.com/bloc97/Anime4K)仓库的代码。

源代码在MIT协议下公开。

2019, net2cn, 用♥发电.