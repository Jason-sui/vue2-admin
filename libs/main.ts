interface UtilInterface {
  $(selector: string): Element | null,
  $$(selector: string): NodeListOf<Element>,
  sleep(time: number): Promise<{ is_sleep: number }>,
  handlePhone(phone_number: string): string,
  containsChinese(str: string): boolean
}


interface UIInterface {
  alert(error: LCError): void,
  toast(text: string): void,
}

class Util implements UtilInterface {
  constructor() {

  }

  $(selector: string) {
    return document.querySelector(selector)
  }
  $$(selector: string) {
    return document.querySelectorAll(selector)
  }

  sleep(time = 10000): Promise<{ is_sleep: number }> {
    return new Promise(s => {
      setTimeout(() => {
        s({ is_sleep: time })
      }, time)
    })
  }
  copyText(text: string, success?: Function) {
    if (navigator.clipboard) {
      console.log('copy navigator.clipboard')
      navigator.clipboard.writeText(text)
        .then(ret => {
          if (success) {
            success()
          } else {
            ui.toast('拷贝成功')
          }
        }).catch((error: Error) => {
          console.log('copy error')
          console.error(error)
          console.log('copy input: ' + copyTextToClipboard(text))
          if (success) {
            success()
          } else {
            ui.toast('拷贝成功')
          }
        })
    } else {
      console.log('copy input: ' + copyTextToClipboard(text))
      if (success) {
        success()
      } else {
        ui.toast('拷贝成功')
      }
    }

    function copyTextToClipboard(text: string, { target = document.body } = {}) {
      if (typeof text !== 'string') {
        throw new TypeError(`Expected parameter \`text\` to be a \`string\`, got \`${typeof text}\`.`)
      }

      const element = document.createElement('textarea')
      const previouslyFocusedElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement

      element.value = text

      // Prevent keyboard from showing on mobile
      element.setAttribute('readonly', '')

      element.style.contain = 'strict'
      element.style.position = 'absolute'
      element.style.left = '-9999px'
      element.style.fontSize = '12pt' // Prevent zooming on iOS

      const selection = document.getSelection() as Selection
      const originalRange = selection.rangeCount > 0 && selection.getRangeAt(0)

      target.append(element)
      element.select()

      // Explicit selection workaround for iOS
      element.selectionStart = 0
      element.selectionEnd = text.length

      let isSuccess = false
      try {
        isSuccess = document.execCommand('copy')
      } catch { }

      element.remove()

      if (originalRange) {
        selection.removeAllRanges()
        selection.addRange(originalRange)
      }

      // Get the focus back on the previously focused element, if any
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus()
      }

      return isSuccess
    }
  }
  handlePhone(phone_number: string): string {
    if (!phone_number) return ''
    const regex = /^(\d{3})(\d{4})(\d{4})$/
    return phone_number.replace(regex, '$1 $2 $3')
  }
  containsChinese(str: string): boolean {
    const reg = /[\u4e00-\u9fa5]/gm
    return reg.test(str)
  }
  downloadImg(url: string) {
    let image = new Image()
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
    image.onload = () => {
      let canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      ctx.drawImage(image, 0, 0, image.width, image.height)
      let ext = image.src.substring(image.src.lastIndexOf('.') + 1).toLowerCase()
      let dataURL = canvas.toDataURL('image/' + ext)
      let a = document.createElement('a')
      a.download = 'download.' + ext
      a.href = dataURL
      a.click()
      a.remove()

    }
  }

  shuffleArray(array: any[]) {
    const new_array = array.slice() // 创建原数组的副本
    for (let i = new_array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = new_array[i]
      new_array[i] = new_array[j]
      new_array[j] = temp
    }
    return new_array
  }

  getURLParams(url: string): { [key: string]: string | string[] } {
    let params = new URLSearchParams(url.replace(/.*#[\w-]+\b[?&]?/g, '')) as URLSearchParamsObject
    let params_obj = Object.fromEntries(params.entries())
    return params_obj
  }

  checkEmptyValue(value: any) {
    return [undefined, null, ''].includes(value)
  }
}

class UI implements UIInterface {
  loading() {
    Vue.prototype.$loading()
  }
  unloading() {
    Vue.prototype.$loading().close()
  }
  alert(error: LCError) {
    Vue.prototype.$alert(error)
  }
  confirm(text: string) {
    return Vue.prototype.$confirm(text)
  }
  prompt(text: string, title: string, option_data: any) {
    return Vue.prototype.$prompt(text, title, option_data)
  }
  toast(message: string, type: string = 'info', duration = 1500) {
    Vue.prototype.$toast(message, type = 'info', duration = 1500)
  }
}


window.util = new Util()
window.ui = new UI()