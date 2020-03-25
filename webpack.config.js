// required for path resolution for dist folder
const path = require("path");
// used to access the BannerPlugin
const webpack = require("webpack");
// required for pretty format for the Userscript banner
const stripIndent = require("common-tags").stripIndent;

module.exports = {
    entry: "./src/entry.ts",
    devtool: "",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        path: path.resolve(__dirname, "."),
        filename: "bilibili_anime4k.user.js"
    },
    plugins: [
        new webpack.BannerPlugin({
            raw: true,
            banner: stripIndent
                `
                // ==UserScript==
                // @name                Bilibili_Anime4K
                // @name:zh-CN          Bilibili Anime4K滤镜
                // @description         Bring Anime4K to Bilibili's HTML5 player to clearify 2D anime.
                // @description:zh-CN   通过Anime4K滤镜让Bilibili上的2D番剧更加清晰
                // @namespace           http://net2cn.tk/
                // @homepageURL         https://github.com/net2cn/Bilibili_Anime4K/
                // @supportURL          https://github.com/net2cn/Bilibili_Anime4K/issues
                // @version             1.0.0
                // @author              net2cn
                // @copyright           bloc97, DextroseRe, NeuroWhAI, and all contributors of Anime4K
                // @match               *://www.bilibili.com/video/av*
                // @match               *://www.bilibili.com/bangumi/play/ep*
                // @match               *://www.bilibili.com/bangumi/play/ss*
                // @match               *://www.bilibili.com/video/BV*
                // @grant               none
                // @license             MIT License
                // @run-at              document-idle
                // ==/UserScript==
                `
        })
    ]
};