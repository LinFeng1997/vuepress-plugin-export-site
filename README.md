# vuepress-plugin-export-site

> export-site plugin for vuepress

## Install
```
npm i vuepress-plugin-export-site
```

## Usage
```
module.exports = {
  plugins: [
  ['vuepress-plugin-export-site', {
     extension: 'pdf'
  }]
  ]
}
```

## Options

1. extension

generator file type.such as pdf.

2. pageReorganization

page reorganization function:
```javascript
{
  extension: 'pdf',
  pageReorganization: pages => pages.slice(0,5)
}
```
