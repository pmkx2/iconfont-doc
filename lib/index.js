/*
  文档生成工具：从 icon-font文件中生成icon图例
*/

'use strict';

const fs = require('fs')
const path = require('path')

// 默认参数
let defOptions = {
    iconfont: '',               // iconfont文件路径
    output: '',                 // 文档输出路径
    outputName: 'icon.html',    // 输出的文档名称，默认值“icon.html”
    prefix: 'icon'              // 使用的icon前缀，默认值“icon”
}

// 同步
let docIcon = function (options = {}) {
    const self = {}
    // 参数替换
    let opts = {
        ...defOptions,
        ...options
    }

    // 读取html模版文件
    let htmlTpl = fs.readFileSync(path.join(__dirname, './htmlTpl.html'), 'utf8')
    // 读取iconfont源文件
    const iconfont = fs.readFileSync(opts.iconfont, 'utf8')
    // 替换默认路径为https
    const iconfontFile = iconfont.replace(/url\(\'\/\//g, 'url(\'https://')

    // iconfont名称匹配表达式：匹配所有从“.”和“:b”之间的字母、数字和指定字符（不分大小写）
    const matchIconReg = /(?<=\.)([a-z0-9\-\_]+)(?=\:b)/gim
    const iconList = iconfontFile.match(matchIconReg)

    // 截取icon-item的模版代码：匹配所有从“item-->”和“<!--item”之间的非"^"字符（不分大小写）
    const iconItemReg = /(?<=item\-\-\>)([^\^]+)(?=\<\!\-\-\/item)/gim
    let iconItemHtml = (htmlTpl.match(iconItemReg)).join()

    // 组合icon代码
    let allIconHtml = []
    for (let i = 0; i < iconList.length; i++) {
        let itemHtml = iconItemHtml
            .replace('{{prefix}}', opts.prefix)         // 置换模版内的icon前缀
            .replace(/\{\{iconName\}\}/g, iconList[i])  // 置换模版内的icon名称
        allIconHtml.push(itemHtml)
    }


    // 组合模版代码
    self.htmlTpl = htmlTpl
        .replace('{{iconFont}}', iconfontFile)          // 置换icon样式
        .replace(iconItemHtml, allIconHtml.join(''))    // 置换icon模版
        .replace(/\{\{prefix\}\}/g, opts.prefix)        // 置换icon前缀


    // 判断是否存在该文件夹
    fs.stat(opts.output, (err, data) => {
        if(!data || !data.isDirectory()) {
            fs.mkdirSync(opts.output)
        }

        // 在对应目录生成模版文件
        const outputPath = path.join(opts.output, opts.outputName)
        fs.writeFile(outputPath, self.htmlTpl, (err) => {
            if (err) {
                return console.error('模版文件输出失败: ' + err)
            }
            console.log('模版文件输出成功: ')
            console.log(outputPath)
        })
    })

    return self
}

module.exports = docIcon
module.exports.default = docIcon
