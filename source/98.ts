namespace JS98  
{

    enum grabTypes
    {
        header,
        n,
        w,
        s,
        e,
        ne,
        se,
        sw,
        nw
    }

    enum mouseStates
    {
        none,
        drag_start,
        grab_start,
        drag,
        grab
    }

    export class Desktop
    {
        element: HTMLElement
        iconLayer: IconLayer
        windowLayer: WindowLayer

        constructor()
        {
            this.element = document.createElement("div")
            this.element.oncontextmenu = (event) =>
            {
                event.preventDefault()
            }
            this.element.setAttribute("id", "JS98")
            document.body.insertAdjacentElement("beforeend", this.element)
        }

        Add(element: any)
        {
            if (element instanceof Icon)
            {
                if (typeof this.iconLayer == "undefined")
                {
                    this.iconLayer = new IconLayer(this.element)
                }

                this.iconLayer.Add(element)
            }

            if (element instanceof Window)
            {
                if (typeof this.windowLayer == "undefined")
                {
                    this.windowLayer = new WindowLayer(this.element)
                }

                this.windowLayer.Add(element)
            }


        }

        Remove(element: any)
        {
            if (element instanceof Icon)
            {
                if (typeof this.iconLayer == "undefined")
                {
                    console.error("JS98.Desktop.Remove() icon cannot exist because there is no JS98.IconLayer!")
                    return
                }

                this.iconLayer.Remove(element)
            }

            if (element instanceof Window)
            {

                if (typeof this.windowLayer == "undefined")
                {
                    console.error("JS98.Desktop.Remove() window cannot exist because there is no JS98.WindowLayer!")
                }

                this.windowLayer.Remove(element)
            }
        }
    }

    export class IconLayer
    {

        parent: HTMLElement
        element: HTMLElement
        canvas: HTMLCanvasElement
        ctx: CanvasRenderingContext2D

        icons: Icon[] = []
        clicked: Icon

        mouse: {
            start: Vector2
            state: mouseStates,
        }

        private keyboard = new JS98.Keyboard()

        constructor(parent: HTMLElement)
        {
            this.canvas = document.createElement("canvas")
            this.canvas.setAttribute("id", "JS98canvas")
            parent.appendChild(this.canvas)

            this.element = document.createElement("div")
            this.element.setAttribute("id", "JS98iconLayer")
            parent.appendChild(this.element)

            document.addEventListener("mousedown", (event) => this.OnDown(event))
            document.addEventListener("mouseup", (event) => this.OnUp(event))
            document.addEventListener("mousemove", (event) => this.OnMouseMove(event))

            window.addEventListener("resize", (event) => this.OnResize(event))

            this.canvas.width = this.element.clientWidth
            this.canvas.height = this.element.clientWidth
            this.ctx = this.canvas.getContext("2d")

            this.mouse = {
                start: new Vector2(0, 0),
                state: mouseStates.none,
            }
        }


        //eventlisteners
        private OnDown(event: MouseEvent)
        {
            this.mouse.start = new Vector2(event.clientX, event.clientY)

            let nodes = []
            event.composedPath().forEach(i =>
            {
                if (i instanceof HTMLElement)
                {
                    nodes.push(i)
                }
            })

            if (nodes.includes(this.element))
            {
                let counter = 0

                nodes.forEach(element =>
                {
                    this.icons.forEach(icon =>
                    {
                        if (icon.element == element)
                        {
                            this.clicked = icon
                            counter++
                        }
                    })
                })

                if (counter == 0)
                {
                    this.clicked = undefined
                    this.mouse.state = mouseStates.drag_start
                } else
                {
                    this.mouse.state = mouseStates.grab_start
                }
            }

        }

        private OnUp(event: Event)
        {
            if (this.mouse.state == mouseStates.grab_start || this.mouse.state == mouseStates.drag_start)
            {
                this.icons.forEach(icon =>
                {
                    icon.DeStyle("clicked")
                })

                if (!this.keyboard[17])
                {
                    this.icons.forEach(icon =>
                    {
                        icon.Deselect()
                    })
                }

                if (this.mouse.state == mouseStates.grab_start)
                {

                    if (this.keyboard[17] && (typeof this.clicked != undefined && this.clicked.selected))
                    {
                        this.clicked.Deselect()

                    }
                    else if (this.clicked.focus)
                    {
                        this.clicked.Execute()
                        this.clicked.focus = false
                        this.clicked.Deselect()
                        this.clicked.Style("clicked")
                    }
                    else
                    {

                        this.clicked.Select()
                        this.clicked.Style("clicked")

                        this.clicked.focus = true
                        this.clicked.FocusReset(this.clicked)
                    }
                }
            }

            if (this.mouse.state == mouseStates.grab)
            {
                this.icons.forEach(icon =>
                {
                    icon.DeStyle("grab")
                })
            }

            this.mouse.state = mouseStates.none
        }

        private OnMouseMove(event: MouseEvent)
        {

            this.ctx.clearRect(0, 0, this.element.clientWidth, this.element.clientHeight)

            if (this.mouse.state == mouseStates.grab_start || this.mouse.state == mouseStates.drag_start)
            {
                if (Math.abs(event.clientX - this.mouse.start.x) > 10 || Math.abs(event.clientY - this.mouse.start.y) > 10)
                {
                    if (this.mouse.state == mouseStates.grab_start)
                    {
                        if (!this.clicked.selected)
                        {
                            this.icons.forEach(icon =>
                            {
                                icon.Deselect()
                            })
                        }

                        this.clicked.Select()

                        this.icons.forEach(icon =>
                        {
                            icon.DragOffset = new Vector2(icon.position.x - this.mouse.start.x, icon.position.y - this.mouse.start.y)
                        })

                        this.mouse.state = mouseStates.grab
                    }

                    if (this.mouse.state == mouseStates.drag_start)
                    {
                        this.mouse.state = mouseStates.drag
                    }

                }
            }

            if (this.mouse.state == mouseStates.drag)
            {

                //#region draw drag
                this.ctx.fillStyle = "rgba(0, 156, 255, 0.1)"
                this.ctx.fillRect(event.clientX - 0.5, event.clientY - 0.5, this.mouse.start.x - event.clientX, this.mouse.start.y - event.clientY)

                this.ctx.strokeStyle = "black"
                this.ctx.lineWidth = 1
                this.ctx.setLineDash([1, 2])
                this.ctx.strokeRect(event.clientX - 0.5, event.clientY - 0.5, this.mouse.start.x - event.clientX, this.mouse.start.y - event.clientY)
                //#endregion

                //#region dragselect collision
                let selectX1
                let selectX2
                let selectY1
                let selectY2

                if (event.clientX < this.mouse.start.x)
                {
                    selectX1 = event.clientX
                    selectX2 = this.mouse.start.x
                } else
                {
                    selectX1 = this.mouse.start.x
                    selectX2 = event.clientX
                }
                if (event.clientY < this.mouse.start.y)
                {
                    selectY1 = event.clientY
                    selectY2 = this.mouse.start.y
                } else
                {
                    selectY1 = this.mouse.start.y
                    selectY2 = event.clientY
                }

                this.icons.forEach(icon =>
                {

                    if (selectX1 < icon.position.x + icon.size.x &&
                        selectX1 + selectX2 - selectX1 > icon.position.x &&
                        selectY1 < icon.position.y + icon.size.y &&
                        selectY2 - selectY1 + selectY1 > icon.position.y)
                    {
                        icon.Select()
                    } else
                    {
                        icon.Deselect()
                    }

                }
                )

                //#endregion
            }

            if (this.mouse.state == mouseStates.grab)
            {
                this.icons.forEach(icon =>
                {
                    if (icon.selected)
                    {
                        icon.Move(new Vector2(event.clientX + icon.DragOffset.x, event.clientY + icon.DragOffset.y))
                        icon.DeStyle("clicked")
                        icon.Style("grab")
                    }
                })
            }

        }

        OnResize(event: Event)
        {
            this.canvas.width = this.element.clientWidth
            this.canvas.height = this.element.clientHeight
        }


        //methods
        Add(icon: Icon)
        {
            if (!(icon instanceof Icon))
            {
                console.error("JS98.IconLayer.Add() only accepts parameters of type JS98.Icon!")
                return
            }
            this.element.insertAdjacentElement('beforeend', icon.element)
            this.icons.push(icon)

            icon.parent = this;
        }

        Remove(icon: Icon)
        {
            if (!(icon instanceof Icon))
            {
                console.error("JS98.IconLayer.Remove() only accepts parameters of type JS98.Icon!")
                return
            }

            this.element.removeChild(icon.element)
            let index = this.icons.indexOf(icon, 0);
            if (index > -1)
            {
                this.icons.splice(index, 1);
            }
        }
    }

    export class WindowLayer
    {
        parent: HTMLElement
        element: HTMLElement

        windows: Window[] = []

        constructor(parent: HTMLElement)
        {
            this.element = document.createElement("div")
            this.element.setAttribute("id", "JS98windowLayer")
            parent.appendChild(this.element)

            document.addEventListener("mousedown", (event) =>
            {
                this.windows.forEach(window =>
                {
                    if (!event.composedPath().includes(window.element))
                    {
                        window.active = false
                    } else
                    {
                        window.active = true
                    }
                });
            })
        }

        Add(window: Window)
        {
            if (!(window instanceof Window))
            {
                console.error("JS98.WindowLayer.Add() only accepts parameters of type JS98.Window!")
                return
            }
            this.element.insertAdjacentElement('beforeend', window.element)
            this.windows.push(window)

            window.parent = this;
        }

        Remove(window: Window)
        {
            if (!(window instanceof Window))
            {
                console.error("JS98.WindowLayer.Remove() only accepts parameters of type JS98.Window!")
                return
            }
            this.element.removeChild(window.element)
            let index = this.windows.indexOf(window, 0);
            if (index > -1)
            {
                this.windows.splice(index, 1);
            }
        }
    }

    export class Icon
    {

        element: HTMLElement
        titleSpan: HTMLElement
        parent: any;

        action: Function

        DragOffset: Vector2 = new Vector2()

        private _selected: boolean = false
        focus: boolean = false

        private _position = new Vector2()

        constructor(title: string = "undefined", icon: string = "res/defaultIcon.png", x: number = 0, y: number = 0, action: Function = function () { })
        {
            this.action = action

            this.element = document.createElement("div")
            this.element.setAttribute("class", "JS98icon")

            this.position = new Vector2(x, y)

            let img = document.createElement("img")
            img.setAttribute("draggable", "false")
            img.setAttribute("ondragstart", "return false")
            img.setAttribute("src", icon)
            this.element.appendChild(img)

            this.titleSpan = document.createElement("span")
            this.titleSpan.insertAdjacentText("beforeend", title)
            this.element.appendChild(this.titleSpan)

            this.element.style.left = this.position.x + "px"
            this.element.style.top = this.position.y + "px"
        }

        get position(): Vector2
        {
            return this._position;
        }
        set position(value: Vector2)
        {
            this._position = value;
            this.element.style.left = this._position.x + "px"
            this.element.style.top = this._position.y + "px"
        }

        get size(): Vector2
        {
            return new Vector2(this.element.getBoundingClientRect().width, this.element.getBoundingClientRect().height)
        }

        get title(): string
        {
            return this.titleSpan.innerText
        }
        set title(value: string)
        {
            this.titleSpan.innerText = value
        }

        get selected(): boolean
        {
            return this._selected
        }
        set selected(value: boolean)
        {
            if (value && !this._selected)
            {
                this.element.classList.add("JS98icon_selected")
            } if (!value && this._selected)
            {
                this.element.classList.remove("JS98icon_selected")
            }
            this._selected = value
        }

        Execute()
        {
            this.action()
        }

        Select()
        {
            this.selected = true
        }

        Deselect()
        {
            this.selected = false
        }

        Move(position: Vector2)
        {
            this.position = position
        }

        Style(style: string)
        {
            if (style == "grab") this.element.classList.add("JS98icon_grab")
            if (style == "clicked") this.element.classList.add("JS98icon_clicked")
        }

        DeStyle(style: string)
        {
            if (style == "grab") this.element.classList.remove("JS98icon_grab")
            if (style == "clicked") this.element.classList.remove("JS98icon_clicked")
        }

        FocusReset(icon: Icon)
        {
            setTimeout(function ()
            {
                icon.focus = false
            }, 200)
        }

    }

    export class Window
    {
        element: HTMLElement
        body: HTMLElement
        parent: any;
        minSize = new Vector2()

        private _content: HTMLElement

        private _position = new Vector2()
        private prev_position = new Vector2()

        private _size = new Vector2()
        private prev_size = new Vector2()

        private _title: string
        private _icon: string
        private header: HTMLElement
        private headerSpan: HTMLElement
        private headerIcon: HTMLImageElement

        private grabbed: boolean = false
        private _active: boolean
        private grabType: grabTypes
        private mouseStart: Vector2 = new Vector2()

        private _resizeAble: boolean
        private resizerN: HTMLElement
        private resizerW: HTMLElement
        private resizerS: HTMLElement
        private resizerE: HTMLElement
        private resizerNE: HTMLElement
        private resizerSE: HTMLElement
        private resizerNW: HTMLElement
        private resizerSW: HTMLElement

        private _minimizeAble: boolean
        private minimizeButton: HTMLElement
        private _maximizeAble: boolean
        private maximizeButton: HTMLElement
        private imageMaximizeButton: HTMLImageElement
        private _closeAble: boolean
        private closeButton: HTMLElement
        fullscreen = false


        constructor(title: string = "undefined", icon: string = "res/defaultIcon.png", content: HTMLElement = null, position: Vector2 = new Vector2(), size: Vector2 = new Vector2(300, 300))
        {
            //elements
            this.element = document.createElement("div")
            this.element.setAttribute("class", "JS98window")

            this._position = position
            this.size = size

            this.header = document.createElement("header")
            this.header.addEventListener("mousedown", (event) =>
            {
                this.grabbed = true
                this.grabType = grabTypes.header
                this.mouseStart = new Vector2(event.clientX - this.position.x, event.clientY - this.position.y)
                this.body.style.pointerEvents = "none"
            })
            this.headerIcon = document.createElement("img")
            this.headerIcon.draggable = false
            this.header.appendChild(this.headerIcon)
            this.icon = icon
            this.headerSpan = document.createElement("span")
            this.header.appendChild(this.headerSpan)
            this.title = title
            this.element.appendChild(this.header)

            this.active = true

            //#region buttons

            this.closeButton = document.createElement("button")
            this.closeButton.addEventListener("click", (event) =>
            {
                this.parent.Remove(this)
            })
            this.header.appendChild(this.closeButton)
            this.closeButton.insertAdjacentHTML("beforeend", "<img draggable=\"false\" src=\"res/close.png\">")
            this.closeAble = true

            this.maximizeButton = document.createElement("button")
            this.maximizeButton.addEventListener("click", (event) =>
            {
                if (this.fullscreen)
                {
                    this.fullscreen = false
                    this.size = this.prev_size
                    this.position = this.prev_position
                    this.imageMaximizeButton.src = "res/max.png"
                } else
                {
                    this.fullscreen = true

                    this.prev_size = this.size
                    this.prev_position = this.position

                    this.size = new Vector2(this.parent.element.clientWidth - 8, this.parent.element.clientHeight - 8)
                    this.position = new Vector2(0, 0)
                    this.imageMaximizeButton.src = "res/mid.png"

                }
            })
            this.imageMaximizeButton = document.createElement("img")
            this.imageMaximizeButton.src = "res/max.png"
            this.imageMaximizeButton.draggable = false
            this.maximizeButton.appendChild(this.imageMaximizeButton)
            this.header.appendChild(this.maximizeButton)
            this.maximizeAble = true

            this.minimizeButton = document.createElement("button")
            this.minimizeButton.addEventListener("click", (event) =>
            {

            })
            this.header.appendChild(this.minimizeButton)
            this.minimizeButton.insertAdjacentHTML("beforeend", "<img draggable=\"false\" src=\"res/min.png\">")
            this.minimizeAble = true

            //#endregion

            //#region resizers
            this.resizerN = document.createElement("div")
            this.resizerN.classList.add("JS98resizer", "JS98resizer-n")
            this.resizerN.addEventListener("mousedown", (event) =>
            {
                this.grabbed = true
                this.grabType = grabTypes.n
                this.body.style.pointerEvents = "none"
            })
            this.element.appendChild(this.resizerN)

            this.resizerW = document.createElement("div")
            this.resizerW.classList.add("JS98resizer", "JS98resizer-w")
            this.resizerW.addEventListener("mousedown", (event) =>
            {
                this.grabbed = true
                this.grabType = grabTypes.w
                this.body.style.pointerEvents = "none"
            })
            this.element.appendChild(this.resizerW)

            this.resizerS = document.createElement("div")
            this.resizerS.classList.add("JS98resizer", "JS98resizer-s")
            this.resizerS.addEventListener("mousedown", (event) =>
            {
                this.grabbed = true
                this.grabType = grabTypes.s
                this.body.style.pointerEvents = "none"
            })
            this.element.appendChild(this.resizerS)

            this.resizerE = document.createElement("div")
            this.resizerE.classList.add("JS98resizer", "JS98resizer-e")
            this.resizerE.addEventListener("mousedown", (event) =>
            {
                this.grabbed = true
                this.grabType = grabTypes.e
                this.body.style.pointerEvents = "none"
            })
            this.element.appendChild(this.resizerE)

            this.resizerNE = document.createElement("div")
            this.resizerNE.classList.add("JS98resizer", "JS98resizer-ne")
            this.resizerNE.addEventListener("mousedown", (event) =>
            {
                this.grabbed = true
                this.grabType = grabTypes.ne
                this.body.style.pointerEvents = "none"
            })
            this.element.appendChild(this.resizerNE)

            this.resizerSE = document.createElement("div")
            this.resizerSE.classList.add("JS98resizer", "JS98resizer-se")
            this.resizerSE.addEventListener("mousedown", (event) =>
            {
                this.grabbed = true
                this.grabType = grabTypes.se
                this.body.style.pointerEvents = "none"
            })
            this.element.appendChild(this.resizerSE)

            this.resizerSW = document.createElement("div")
            this.resizerSW.classList.add("JS98resizer", "JS98resizer-sw")
            this.resizerSW.addEventListener("mousedown", (event) =>
            {
                this.grabbed = true
                this.grabType = grabTypes.sw
                this.body.style.pointerEvents = "none"
            })
            this.element.appendChild(this.resizerSW)

            this.resizerNW = document.createElement("div")
            this.resizerNW.classList.add("JS98resizer", "JS98resizer-nw")
            this.resizerNW.addEventListener("mousedown", (event) =>
            {
                this.grabbed = true
                this.grabType = grabTypes.nw
                this.body.style.pointerEvents = "none"
            })
            this.element.appendChild(this.resizerNW)
            this.resizeAble = true
            //#endregion

            //content
            this.body = document.createElement("div")
            if (content != null)
            {
                this.content = content;
            }
            this.element.appendChild(this.body)

            document.addEventListener("mousemove", (event) => this.OnMouseMove(event))
            window.addEventListener("resize", (event) => this.OnResize(event))
            document.addEventListener("mouseup", (event) =>
            {
                this.grabbed = false;
                this.body.style.pointerEvents = "all"
            })

        }

        get resizeAble(): boolean
        {
            return this._resizeAble
        }
        set resizeAble(value: boolean)
        {
            if (value)
            {
                this.resizerN.hidden = false
                this.resizerW.hidden = false
                this.resizerS.hidden = false
                this.resizerE.hidden = false
                this.resizerN.hidden = false
                this.resizerS.hidden = false
                this.resizerN.hidden = false
                this.resizerS.hidden = false
            }
            else
            {
                this.resizerN.hidden = true
                this.resizerW.hidden = true
                this.resizerS.hidden = true
                this.resizerE.hidden = true
                this.resizerN.hidden = true
                this.resizerS.hidden = true
                this.resizerN.hidden = true
                this.resizerS.hidden = true
            }
            this._resizeAble = value
        }

        //buttons
        get minimizeAble(): boolean
        {
            return this._minimizeAble
        }
        set minimizeAble(value: boolean)
        {
            if (value)
            {
                this.minimizeButton.hidden = false
            }
            else
            {
                this.minimizeButton.hidden = true
            }

            this._minimizeAble = value
        }

        get maximizeAble(): boolean
        {
            return this._maximizeAble
        }
        set maximizeAble(value: boolean)
        {
            if (value)
            {
                this.maximizeButton.hidden = false
            }
            else
            {
                this.minimizeButton.hidden = true
            }

            this._maximizeAble = value
        }

        get closeAble(): boolean
        {
            return this._closeAble
        }
        set closeAble(value: boolean)
        {
            if (value)
            {
                this.closeButton.hidden = true
            }
            else
            {
                this.closeButton.hidden = false
            }

            this._closeAble = value
        }

        get position(): Vector2
        {
            return this._position;
        }
        set position(value: Vector2)
        {
            this._position = value;
            this.element.style.top = this._position.y + "px"
            this.element.style.left = this._position.x + "px"
        }

        get size(): Vector2
        {
            return this._size;
        }
        set size(value: Vector2)
        {
            this._size = value;
            this.element.style.width = this._size.x + "px"
            this.element.style.height = this._size.y + "px"
        }

        get title(): string
        {
            return this.headerSpan.innerText;
        }
        set title(value: string)
        {
            this.headerSpan.innerText = value;
        }

        get icon(): string
        {
            return this._icon
        }
        set icon(value: string)
        {
            this.headerIcon.src = value
        }

        get content(): HTMLElement
        {
            return this._content
        }

        set content(value: HTMLElement)
        {
            while (this.body.firstChild)
            {
                this.body.removeChild(this.body.firstChild);
            }
            this.body.insertAdjacentElement("beforeend", value)
            this._content = value
        }

        get active(): boolean
        {
            return this._active
        }
        set active(value: boolean)
        {
            if (value)
            {
                this.header.classList.add("JS98active")
            } else
            {
                this.header.classList.remove("JS98active")
            }

            this._active = value
        }

        SetPosition(position: Vector2)
        {
            this.position = position
        }

        SetSize(size: Vector2)
        {
            this.size = size
        }

        SetTitle(title: string)
        {
            this.title = title
        }

        SetContent(content: HTMLElement)
        {
            this.content = content
        }

        SetActive(active: boolean)
        {
            this.active = active
        }


        private OnMouseMove(event: MouseEvent)
        {

            if (this.grabbed && !this.fullscreen)
            {
                if (this.grabType == grabTypes.header)
                {
                    let mousePos = new Vector2(event.clientX, event.clientY)

                    if (mousePos.x > this.parent.element.clientWidth)
                    {
                        mousePos = new Vector2(this.parent.element.clientWidth, mousePos.y)
                    }
                    else if (mousePos.x < 0)
                    {
                        mousePos = new Vector2(0, mousePos.y)
                    }

                    if (mousePos.y > this.parent.element.clientHeight)
                    {
                        mousePos = new Vector2(mousePos.x, this.parent.element.clientHeight)
                    }
                    else if (mousePos.y < 0)
                    {
                        mousePos = new Vector2(mousePos.x, 0)
                    }

                    this.position = new Vector2(mousePos.x - this.mouseStart.x, mousePos.y - this.mouseStart.y)
                }

                if (this.grabType == grabTypes.n || this.grabType == grabTypes.ne || this.grabType == grabTypes.nw)
                {
                    let temp = this.position.y + this.size.y;
                    this.position = new Vector2(this.position.x, event.clientY);
                    this.size = new Vector2(this.size.x, temp - this.position.y);
                    if (this.size.y < this.minSize.y)
                    {
                        this.size = new Vector2(this.size.x, this.minSize.y);
                        this.position = new Vector2(this.position.x, temp - this.minSize.y);
                    }
                }
                if (this.grabType == grabTypes.w || this.grabType == grabTypes.sw || this.grabType == grabTypes.nw)
                {
                    let temp = this.position.x + this.size.x;
                    this.position = new Vector2(event.clientX, this.position.y);
                    this.size = new Vector2(temp - this.position.x, this.size.y);
                    if (this.size.x < this.minSize.x)
                    {
                        this.size = new Vector2(this.minSize.x, this.size.y);
                        this.position = new Vector2(temp - this.minSize.x, this.position.y);
                    }
                }
                if (this.grabType == grabTypes.s || this.grabType == grabTypes.sw || this.grabType == grabTypes.se)
                {
                    this.size = new Vector2(this.size.x, event.clientY - this.position.y);
                    if (this.size.y < this.minSize.y)
                    {
                        this.size = new Vector2(this.size.x, this.minSize.y);
                    }
                }
                if (this.grabType == grabTypes.e || this.grabType == grabTypes.ne || this.grabType == grabTypes.se)
                {
                    this.size = new Vector2(event.clientX - this.position.x, this.size.y);
                    if (this.size.x < this.minSize.x)
                    {
                        this.size = new Vector2(this.minSize.x, this.size.y);
                    }
                }

            }

        }

        private OnResize(event: Event)
        {
            if (this.fullscreen)
            {
                this.size = new Vector2(this.parent.element.clientWidth - 8, this.parent.element.clientHeight - 8)
            }
        }

    }

    export class Keyboard
    {

        this: []
        constructor()
        {
            document.addEventListener("keydown", (event) => this.OnKeyDown(event))
            document.addEventListener("keyup", (event) => this.OnKeyUp(event))
        }

        OnKeyDown(event: KeyboardEvent)
        {
            this[event.keyCode] = true

        }

        OnKeyUp(event: KeyboardEvent)
        {
            this[event.keyCode] = false
        }
    }

    export class Vector2
    {
        private _x: number
        private _y: number

        constructor(x: number = 0, y: number = 0)
        {
            this._x = x
            this._y = y
        }

        get x(): number
        {
            return this._x;
        }

        get y(): number
        {
            return this._y;
        }
    }

    console.log("JS98 library ");
}