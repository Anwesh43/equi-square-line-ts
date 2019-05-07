const scGap : number = 0.05
const scDiv : number = 0.51
const nodes : number = 5
const lines : number = 2
const parts : number = 2
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const foreColor : string = "#673AB7"
const backColor : string = "#BDBDBD"
const w : number = window.innerWidth
const h : number = window.innerHeight

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static scaleFactor(scale : number) : number {
        return Math.floor(scale / scDiv)
    }

    static mirrorValue(scale : number, a : number, b : number) : number {
        const k : number = ScaleUtil.scaleFactor(scale)
        return (1 - k) / a + k / b
    }

    static updateValue(scale : number, dir : number, a : number, b : number) : number {
        return ScaleUtil.mirrorValue(scale, a, b) * dir * scGap
    }
}

class DrawingUtil {

    static drawEquiLine(context : CanvasRenderingContext2D, x : number, size : number, sc : number) {
        context.save()
        context.translate(x, 0)
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(0, -size * sc)
        context.stroke()
        context.restore()
    }

    static drawESLNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const gap : number = w / (nodes + 1)
        const size : number = gap / sizeFactor
        const sc1 : number = ScaleUtil.divideScale(scale, 0, 2)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, 2)
        context.strokeStyle = foreColor
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.save()
        context.translate(gap * (i + 1), h / 2)
        context.rotate(Math.PI / 2 * sc2)
        for (var j = 0; j < parts; j++) {
            const scj : number = ScaleUtil.divideScale(sc1, j, parts)
            context.save()
            context.scale(1, 1 - 2 * j)
            for (var k = 0; k < lines; k++) {
                const sck : number = ScaleUtil.divideScale(scj, k, lines)
                DrawingUtil.drawEquiLine(context, -size + 2 * size * j, size, scj)
            }
            context.restore()
        }
        context.restore()
    }
}

class EquiSquareLineStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : EquiSquareLineStage = new EquiSquareLineStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += ScaleUtil.updateValue(this.scale, this.dir, lines * parts, 1)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}
