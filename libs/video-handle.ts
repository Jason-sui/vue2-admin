// 依赖 CustomVideoHandle
let video_handle_template = document.createElement('template')
video_handle_template.innerHTML = `
<link rel="stylesheet" href="/css/main.css">
<style>
  :host {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    padding: var(--main_gap);
    width: 100%;
    height: 100%;
    background-color: #d0d5ff;
  }

  .video-box {
    display: flex;
    overflow: hidden;
    align-items: center;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 24px;
    width: 100%;
  }

  .video-workspace-container {
    padding: 12px;
    height: 100%;
  }

  .video-workspace {
    height: 100%;
  }

  .video-item {
    width: 100%;
    height: 100%;
  }

  .crop-container {
    position: absolute;
    width: 100%;
    height: 100%;

    inset: 0;
    cursor: pointer;
  }

  .crop-item {
    position: absolute;
    z-index: 6;
    box-sizing: border-box;
    width: 16px;
    height: 16px;
    background-color: #fff;
    box-shadow: 0 2px 2px -2px rgba(54, 24, 79, .5);
    cursor: ew-resize;
  }

  .crop-item[data-position='top'],
  .crop-item[data-position='top-left'],
  .crop-item[data-position='top-right'] {
    top: 0;
  }

  .crop-item[data-position='right'],
  .crop-item[data-position='bottom-right'],
  .crop-item[data-position='top-right'] {
    right: 0;
  }

  .crop-item[data-position='bottom'],
  .crop-item[data-position='bottom-left'],
  .crop-item[data-position='bottom-right'] {
    bottom: 0;
  }

  .crop-item[data-position='top-left'] {
    transform: translate(-50%, -50%);
  }

  .crop-item[data-position='top-right'] {
    transform: translate(50%, -50%);
  }

  .crop-item[data-position='bottom-right'] {
    transform: translate(50%, 50%);
  }

  .crop-item[data-position='bottom-left'] {
    transform: translate(-50%, 50%);
  }

  .crop-item[data-position='left'],
  .crop-item[data-position='right'] {
    width: 4px;
    height: 100%;
  }

  .crop-item[data-position='left'] {
    transform: translateX(-50%);
  }

  .crop-item[data-position='right'] {
    transform: translateX(50%);
  }

  .crop-item[data-position='top'] {
    transform: translateY(-50%);
  }

  .crop-item[data-position='bottom'] {
    transform: translateY(50%);
  }

  .crop-item[data-position='top'],
  .crop-item[data-position='bottom'] {
    width: 100%;
    height: 4px;
  }

  .button-primary {
    padding: 0 12px;
  }

  .button-primary+.button-primary {
    margin-left: 12px;
  }

  .input-number {
    width: 80px;
    border: none;
    background-color: unset;
    font-size: 28px;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  .frame-box {
    margin: 24px 0;
    padding: 0 12px;
    width: 100%;
    height: 80px;
    position: relative;
  }

  .frame-right,
  .frame-left {
    position: absolute;
    display: flex;
    height: 100%;
  }

  .frame-list {
    display: flex;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  .frame-img {
    flex: 1;
    min-width: 1px;
    height: 100%;
  }
</style>
<div class="video-box">
  <div class="video-workspace-container">
    <div class="video-workspace relative">
      <video class="video-item" crossorigin="anonymous" playsinline="playsinline" preload="metadata"></video>
      <div class="crop-container">
        <div class="crop-item" data-position="top"></div>
        <div class="crop-item" data-position="right"></div>
        <div class="crop-item" data-position="bottom"></div>
        <div class="crop-item" data-position="left"></div>
        <div class="crop-item" data-position="top-left"></div>
        <div class="crop-item" data-position="top-right"></div>
        <div class="crop-item" data-position="bottom-right"></div>
        <div class="crop-item" data-position="bottom-left"></div>
      </div>
    </div>
  </div>
</div>
<div class="frame-box">
  <div class="frame-left"></div>
  <div class="frame-list"></div>
  <div class="frame-right"></div>
  <div class="time-line"></div>
</div>
<div class="foot-tool flex aic jcc">
  <div class="mr-12">
    <span>起始时间</span><input class="input-number input-start" type="number" min="0" step="0.125">
    <span>结束时间</span><input class="input-number input-end" type="number" step="0.125">
  </div>
  <div class="button-primary" data-button_type="video" data-value="origin">原始比例<span class="origin-value"></span>
  </div>
  <div class="button-primary" data-button_type="video" data-value="1/1">1:1</div>
  <div class="button-primary" data-button_type="video" data-value="16/9">16:9</div>
  <div class="button-primary" data-button_type="video" data-value="9/16">9:16</div>
  <div class="button-primary" data-button_type="video" data-value="4/3">4:3</div>
  <div class="button-primary" data-button_type="video" data-value="3/4">3:4</div>
  <div class="mx-12 flex aic">
    <input class="input-number input-x" type="number" min="1"><span class="mx-4">X</span>
    <input class="input-number input-y" type="number" min="1">
  </div>
  <div class="button-primary" data-button_type="save">保存</div>
</div>
`
class VideoHandle extends HTMLElement {
  private shadow: ShadowRoot
  private video: HTMLVideoElement
  private handle: CustomVideoHandle
  private crop_container: HTMLElement
  private video_workspace: HTMLElement
  private input_x: HTMLInputElement
  private input_y: HTMLInputElement
  private input_rate: number = 1
  private input_start: HTMLInputElement
  private input_end: HTMLInputElement
  private frame_box: HTMLElement
  private frame_list: HTMLElement
  private frame_left: HTMLElement
  private frame_right: HTMLElement
  private origin_value_box: HTMLElement
  private foot_tool: HTMLElement
  private drog_start: boolean = false
  private origin_rate: string = ''
  private crop_info: {
    position: string | null,
    start_x: number,
    start_y: number,
    change_width: number
    change_height: number
    change_top: number
    change_left: number
    change_bottom: number
    change_right: number

  } = {
      position: '',
      start_x: 0,
      start_y: 0,
      change_width: 0,
      change_height: 0,
      change_top: 0,
      change_left: 0,
      change_bottom: 0,
      change_right: 0,
    }
  video_origin_data: {
    duration: number,
    width: number,
    height: number,
  } = {
      duration: 0,
      width: 0,
      height: 0,
    }
  video_data: {
    start: number,
    end: number,
    width: number,
    height: number,
    x?: number,
    y?: number,
    rate: number
  } = {
      start: 0,
      end: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      rate: 1
    }
  image_list: string[] = []
  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.shadow.appendChild(video_handle_template.content.cloneNode(true))
    this.crop_container = this.shadow.querySelector('.crop-container')!
    this.video_workspace = this.shadow.querySelector('.video-workspace')!
    this.video = this.shadow.querySelector('video')!
    this.input_x = this.shadow.querySelector('.input-x')!
    this.input_y = this.shadow.querySelector('.input-y')!
    this.input_start = this.shadow.querySelector('.input-start')!
    this.input_end = this.shadow.querySelector('.input-end')!
    this.origin_value_box = this.shadow.querySelector('.origin-value')!
    this.foot_tool = this.shadow.querySelector('.foot-tool')!
    this.frame_box = this.shadow.querySelector('.frame-box')!
    this.frame_list = this.shadow.querySelector('.frame-list')!
    this.frame_left = this.shadow.querySelector('.frame-left')!
    this.frame_right = this.shadow.querySelector('.frame-right')!
    this.handle = new CustomVideoHandle()

    // 事件监听
    this.foot_tool.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement
      let item = target.closest('.button-primary') as HTMLElement
      if (item) {
        let { value = '', button_type } = item.dataset
        this.handleItemClick({ button_type, value })
      }
    })
    this.input_x.addEventListener('input', () => {
      let value = +this.input_x.value
      if (value < this.video_origin_data.width) {
        let new_width = value * this.input_rate
        this.crop_container.style.width = new_width + 'px'
        setTimeout(() => {
          this.getVideoShowData()
        })
      }
    })
    this.input_y.addEventListener('input', () => {
      let value = +this.input_y.value
      if (value < this.video_origin_data.height) {
        let new_height = value * this.input_rate
        this.crop_container.style.height = new_height + 'px'
        setTimeout(() => {
          this.getVideoShowData()
        })
      }
    })

    this.input_start.addEventListener('input', () => {
      let value = +this.input_start.value
      if (value < this.video_origin_data.duration - 1) {
        this.video.currentTime = value
      } else {
        this.input_start.value = this.video_origin_data.duration - 1 + ''
      }
    })
    this.input_end.addEventListener('input', () => {
      let value = +this.input_end.value
      if (value < this.video_origin_data.duration) {

      } else {
        this.input_end.value = this.video_origin_data.duration + ''
      }
    })

    this.frame_list.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement
      let item = target.closest('.frame-img') as HTMLElement
      if (item) {
        let { index = '' } = item.dataset
        this.video.currentTime = +index / 8
        this.video_data.start = this.video.currentTime
      }
    })
  }

  connectedCallback() {
    // 添加 mouseup 和 mousemove 事件监听器到全局
    this.crop_container.addEventListener('mousedown', this.handleCropDragStart.bind(this))
    this.crop_container.addEventListener('mousemove', this.handleCropDrag.bind(this))
    this.crop_container.addEventListener('mouseup', this.handleCropDragEnd.bind(this))
    document.addEventListener('mousedown', this.handleCropDragEnd.bind(this))
    document.addEventListener('mousemove', this.handleCropDrag.bind(this))
  }

  init(url: string) {
    return this.handle.getVideoData({ video_url: url })
      .then((res: any) => {
        let { width, height, duration } = res
        duration = duration.toFixed(1)
        this.video.src = url
        this.video_origin_data = res
        this.video_data.width = width
        this.video_data.height = height
        this.video_data.end = +duration
        this.input_x.setAttribute('max', width)
        this.input_x.value = width
        this.input_y.setAttribute('max', height)
        this.input_y.value = height
        this.origin_rate = this.getVideoAspectRatio(width, height)
        this.origin_value_box.textContent = this.origin_rate
        this.input_start.value = '0'
        this.input_end.value = duration
        setTimeout(() => {
          let workspace_data = this.video_workspace.getBoundingClientRect()
          let { max_width, max_height } = this.calculateDimensions(width, height, workspace_data.width, workspace_data.height)
          this.video_workspace.style.width = max_width + 'px'
          this.video_workspace.style.height = max_height + 'px'
          this.input_rate = max_width / width
        })
        this.getFrame()
        return Promise.resolve()
      })
      .catch((err: Error) => {
        console.log(err)
      })
  }

  getVideoAspectRatio(width: number, height: number): string {
    const aspectRatio = width / height;

    if (Math.abs(aspectRatio - 9 / 16) < 0.01) {
      return '9:16';
    } else if (Math.abs(aspectRatio - 16 / 9) < 0.01) {
      return '16:9';
    } else if (Math.abs(aspectRatio - 3 / 4) < 0.01) {
      return '3:4';
    } else if (Math.abs(aspectRatio - 4 / 3) < 0.01) {
      return '4:3';
    } else if (Math.abs(aspectRatio - 1) < 0.01) {
      return '1:1';
    } else {
      return 'Custom'
    }
  }

  calculateDimensions(video_width: number, video_height: number, container_width: number, container_height: number) {
    // 计算视频宽高的最大公约数
    function gcd(a: number, b: number): number {
      return b === 0 ? a : gcd(b, a % b);
    }
    const gcd_value = gcd(video_width, video_height)
    // 计算宽度和高度的整数比例值
    const width_ratio = video_width / gcd_value
    const height_ratio = video_height / gcd_value
    // 找到适合容器的最大整数比例值
    const max_ratio = Math.min(
      Math.floor(container_width / width_ratio),
      Math.floor(container_height / height_ratio)
    )
    // 计算宽度和高度
    const max_width = max_ratio * width_ratio
    const max_height = max_ratio * height_ratio
    return { max_width, max_height }
  }

  // 处理拖拽事件
  handleCropDrag(event: MouseEvent) {
    // 阻止事件传播
    event.stopPropagation()
    // 检查是否有拖拽点正在拖拽
    if (!this.drog_start) return
    const crop_info = this.crop_info
    // 获取当前 crop-container 的位置和尺寸
    const rect = this.crop_container.getBoundingClientRect()
    // 获取父级容器的位置和尺寸
    const parent_rect = this.video_workspace.getBoundingClientRect()
    // 计算左、右、上、下四个边的距离
    const delta_top = Math.abs(rect.top - parent_rect.top)
    const delta_left = Math.abs(rect.left - parent_rect.left)
    const delta_bottom = Math.abs(rect.bottom - parent_rect.bottom)
    const delta_right = Math.abs(rect.right - parent_rect.right)

    // 计算两者的高度宽度差
    const delta_width = delta_left + delta_right
    const delta_height = delta_top + delta_bottom
    // 计算鼠标移动的距离
    const delta_x = event.movementX
    const delta_y = event.movementY
    let inset_left
    let inset_right
    let inset_top
    let inset_bottom
    if (!crop_info.position) {
      // 没有空间移动
      // 限制位移不能超出剩余的空间，也不能小于0
      if (!delta_height && !delta_width) return
      // 计算新的选区位置
      let new_left = rect.left + delta_x
      let new_top = rect.top + delta_y
      // 计算左、右、上、下四个边的位移
      inset_left = new_left - parent_rect.left
      inset_right = parent_rect.right - (new_left + rect.width)
      inset_top = new_top - parent_rect.top
      inset_bottom = parent_rect.bottom - (new_top + rect.height)
      inset_left = Math.min(Math.max(inset_left, 0), delta_width)
      inset_right = Math.min(Math.max(inset_right, 0), delta_width)
      inset_top = Math.min(Math.max(inset_top, 0), delta_height)
      inset_bottom = Math.min(Math.max(inset_bottom, 0), delta_height)
      // 使用 inset 属性设置选区的位置
      this.crop_container.style.inset = `${inset_top}px ${inset_right}px ${inset_bottom}px ${inset_left}px`
    } else {
      let new_height, new_width
      switch (crop_info.position) {
        case 'top':
          new_height = Math.max(Math.min((rect.height - delta_y), parent_rect.height), 50)
          inset_top = Math.max(delta_top + delta_y, 0)
          this.crop_container.style.inset = `${inset_top}px ${delta_right}px ${delta_bottom}px ${delta_left}px`
          this.crop_container.style.height = new_height + 'px'
          break
        case 'bottom':
          new_height = Math.max(Math.min((rect.height + delta_y), parent_rect.height), 50)
          inset_bottom = Math.max(delta_top + delta_y, 0)
          this.crop_container.style.inset = `${delta_top}px ${delta_right}px ${inset_bottom}px ${delta_left}px`
          this.crop_container.style.height = new_height + 'px'
          break
        case 'left':
          new_width = Math.max(Math.min((rect.width - delta_x), parent_rect.width), 50)
          inset_left = Math.min(Math.max(delta_left + delta_x, 0), parent_rect.width - 50)
          this.crop_container.style.inset = `${delta_top}px ${delta_right}px ${delta_bottom}px ${inset_left}px`
          this.crop_container.style.width = new_width + 'px'
          break
        case 'right':
          new_width = Math.max(Math.min((rect.width + delta_x), parent_rect.width), 50)
          inset_right = Math.min(Math.max(delta_right - delta_x, 0), parent_rect.width - 50)
          this.crop_container.style.inset = `${delta_top}px ${inset_right}px ${delta_bottom}px ${delta_left}px`
          this.crop_container.style.width = new_width + 'px'
          break
        case 'top-left':
          new_height = Math.max(Math.min((rect.height - delta_y), parent_rect.height), 50)
          inset_top = Math.max(delta_top + delta_y, 0)
          new_width = Math.max(Math.min((rect.width - delta_x), parent_rect.width), 50)
          inset_left = Math.min(Math.max(delta_left + delta_x, 0), parent_rect.width - 50)
          this.crop_container.style.inset = `${inset_top}px ${delta_right}px ${delta_bottom}px ${inset_left}px`
          this.crop_container.style.height = new_height + 'px'
          this.crop_container.style.width = new_width + 'px'
          break
        case 'top-right':
          new_height = Math.max(Math.min((rect.height - delta_y), parent_rect.height), 50)
          inset_top = Math.max(delta_top + delta_y, 0)
          new_width = Math.max(Math.min((rect.width + delta_x), parent_rect.width), 50)
          inset_right = Math.min(Math.max(delta_right - delta_x, 0), parent_rect.width - 50)
          this.crop_container.style.inset = `${inset_top}px ${inset_right}px ${delta_bottom}px ${delta_left}px`
          this.crop_container.style.width = new_width + 'px'
          this.crop_container.style.height = new_height + 'px'
          break
        case 'bottom-right':
          new_width = Math.max(Math.min((rect.width + delta_x), parent_rect.width), 50)
          inset_right = Math.min(Math.max(delta_right - delta_x, 0), parent_rect.width - 50)
          new_height = Math.max(Math.min((rect.height + delta_y), parent_rect.height), 50)
          inset_bottom = Math.max(delta_top + delta_y, 0)
          this.crop_container.style.inset = `${delta_top}px ${inset_right}px ${inset_bottom}px ${delta_left}px`
          this.crop_container.style.height = new_height + 'px'
          this.crop_container.style.width = new_width + 'px'
          break
        case 'bottom-left':
          new_width = Math.max(Math.min((rect.width - delta_x), parent_rect.width), 50)
          inset_left = Math.min(Math.max(delta_left + delta_x, 0), parent_rect.width - 50)
          new_height = Math.max(Math.min((rect.height + delta_y), parent_rect.height), 50)
          inset_bottom = Math.max(delta_top + delta_y, 0)
          this.crop_container.style.inset = `${delta_top}px ${delta_right}px ${inset_bottom}px ${inset_left}px`
          this.crop_container.style.height = new_height + 'px'
          this.crop_container.style.width = new_width + 'px'
          break
        default:
          break
      }
    }
  }
  // 处理拖拽开始事件
  handleCropDragStart(event: MouseEvent) {
    this.drog_start = true
    let target = event.target as HTMLElement
    const position = target.getAttribute('data-position')

    // 记录拖拽点的位置信息和鼠标按下时的坐标
    this.crop_info.position = position
    this.crop_info.start_x = event.clientX
    this.crop_info.start_y = event.clientY

    // 阻止事件传播
    event.stopPropagation()
  }
  // 处理拖拽结束事件
  handleCropDragEnd(event: MouseEvent) {
    if (!this.drog_start) return
    this.drog_start = false
    this.crop_info = {
      position: '',
      start_x: 0,
      start_y: 0,
      change_width: 0,
      change_height: 0,
      change_top: 0,
      change_left: 0,
      change_bottom: 0,
      change_right: 0,
    }
    this.getVideoShowData()
  }

  getVideoShowData() {
    // 获取当前 crop-container 的位置和尺寸
    const rect = this.crop_container.getBoundingClientRect()
    // 获取父级容器的位置和尺寸
    const parent_rect = this.video_workspace.getBoundingClientRect()
    // 计算左、右、上、下四个边的距离
    const delta_top = Math.abs(rect.top - parent_rect.top)
    const delta_left = Math.abs(rect.left - parent_rect.left)
    this.video_data.x = delta_left
    this.video_data.y = delta_top
    this.video_data.width = Math.floor(this.video_origin_data.width * rect.width / parent_rect.width)
    this.video_data.height = Math.floor(this.video_origin_data.height * rect.height / parent_rect.height)
    this.video_data.rate = this.video_data.width / this.video_data.height
    this.input_x.value = this.video_data.width + ''
    this.input_y.value = this.video_data.height + ''
  }

  handleItemClick({ button_type = '', value = '' } = {}) {
    let rate, new_height
    let { width, height } = this.crop_container.getBoundingClientRect()
    let parent_rect = this.video_workspace.getBoundingClientRect()
    switch (button_type) {
      case 'save':
        // 输出处理视频
        this.outputVideo()
        break
      case 'video':
        // 变更视频比例
        switch (value) {
          case 'origin':
            this.crop_container.style.inset = `0 0 0 0`
            this.crop_container.style.height = parent_rect.height + 'px'
            this.crop_container.style.width = parent_rect.width + 'px'
            setTimeout(() => {
              this.getVideoShowData()
            })
            return
          default:
            rate = eval(value)
            this.video_data.rate = rate
            new_height = width / rate
            this.crop_container.style.height = new_height + 'px'
            setTimeout(() => {
              this.getVideoShowData()
            })
            break
        }
        break
      default:
        break
    }
  }

  getFrame() {
    ui.loading()
    this.handle.convertVideoToImages({ video_url: this.video.src })
      .then((res: any) => {
        this.image_list = res
        let html = this.image_list.reduce((p, c: string, index: number) => p += `
        <img class="frame-img" src="${c}" data-index="${index}">
        `, '')
        this.frame_list.innerHTML = html
      })
      .catch((err: Error) => {
        console.log(err)
      })
      .finally(() => {
        ui.unloading()
      })
  }

  outputVideo() {
    let command = [
      '-ss', String(this.video_data.start),
      '-to', String(this.video_data.end),
      '-vf', `crop=${this.video_data.width}:${this.video_data.height}:${this.video_data.x}:${this.video_data.y}`,
      '-c:v', 'libx264',
      '-c:a', 'copy',
      '-strict', 'experimental',
    ]
    ui.loading()
    return this.handle.handleVideoCommand({ video_url: this.video.src, command })
      .then((res: any) => {
        util.downloadBlobUrl(res, 'output.mp4')
        return res
      })
      .finally(() => {
        ui.unloading()
      })
  }

  handleVideoToImage(url: string) {

  }
}
customElements.define('ks-video-handler', VideoHandle)