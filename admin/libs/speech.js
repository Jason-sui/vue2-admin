class CustomWebSpeech {
  constructor() {
    // 检查浏览器是否支持 Web Speech API
    if (!('speechSynthesis' in window)) {
      console.error('抱歉，您的浏览器不支持 Web Speech API。')
      return
    }
    // 创建 SpeechSynthesisUtterance 对象
    this.utterance = new SpeechSynthesisUtterance()
    this.web_speech = window.speechSynthesis

    // 用于存储注册的事件处理函数
    this.events = {}

    // 监听各种语音合成事件
    this.utterance.onend = () => this.emit('end')
    this.utterance.onerror = () => this.emit('error')
    this.utterance.onpause = () => this.emit('pause')
    this.utterance.onresume = () => this.emit('resume')
    this.utterance.onstart = () => this.emit('start')
    this.init()
  }

  init() {
    let index = 0
    let interval = setInterval(() => {
      // 获取支持的语言列表
      this.voices = window.speechSynthesis.getVoices()
      if (this.voices.length) {
        this.setVoice(this.voices[0].name)
        // 设置默认语言（中文）
        this.setLang(this.voices[0].lang)
        clearInterval(interval)
      } else {
        index++
        console.log(index)
      }
    }, 100)
    setTimeout(() => {
      clearInterval(interval)
    }, 3000)
  }

  // 注册自定义事件处理函数
  on(eventName, handler) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(handler)
  }

  // 触发自定义事件
  emit(eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(handler => handler(...args))
    }
  }

  // 获取支持的语言列表
  getSupportedLanguages() {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default
    }))
  }

  // 获取当前选定的语言
  getCurrentLanguage() {
    return this.utterance.lang
  }

  // 播放文本
  play(text) {
    if (text) {
      this.utterance.text = text
      this.web_speech.speak(this.utterance)
    }
  }

  // 暂停播放
  pause() {
    if (this.web_speech.speaking) {
      this.web_speech.pause()
    }
  }

  // 继续播放
  resume() {
    if (this.web_speech.paused) {
      this.web_speech.resume()
    }
  }

  // 取消播放
  cancel() {
    this.web_speech.cancel()
  }

  // 设置语言
  setLang(lang) {
    const supportedLanguages = this.getSupportedLanguages()
    const matching_voice = supportedLanguages.find(voice => voice.lang.toLowerCase() === lang.toLowerCase())
    if (matching_voice) {
      this.utterance.lang = matching_voice.lang
    } else {
      console.warn('不支持的语言，设置失败。')
    }
  }

  // 设置语音
  setVoice(voice_name) {
    const matching_voice = this.voices.find(voice => voice.name === voice_name)
    if (matching_voice) {
      this.voice = matching_voice
      this.utterance.voice = matching_voice
      this.play()
    } else {
      console.warn('找不到指定的语音，设置失败。')
    }
  }
}
