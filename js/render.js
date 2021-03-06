const WIDTH = 2000;
const HEIGHT = 1000;
const SCALE = { x: 0.65, y: 0.65 };

window.onload = function () {
    // 初始化机房stage
    let stage = new Konva.Stage({
        container: 'mainContainer',
        width: WIDTH,
        height: HEIGHT,
        scale: SCALE,
    });
    // let mainContainer = document.getElementById('mainContainer'); // debug
    // mainContainer.style.display = 'none'; // debug
    // 初始化服务器stage
    let serverStage = new Konva.Stage({
        container: 'serverContainer',
        width: WIDTH,
        height: HEIGHT,
        scale: SCALE,
    });
    // 绘制网格
    let grids = drawGrids(stage);
    // 绘制机房轮廓
    let contour = drawRoomContour(stage);
    // 绘制机架
    let rackGroup = new Konva.Group();
    let rackLayer = new Konva.Layer();
    let tagGroup = new Konva.Group();
    let tagLayer = new Konva.Layer();
    let no = 0;
    for (let i = 0.2 * WIDTH; i <= 0.7 * WIDTH; i += 150) {
        for (let j = 0.2 * HEIGHT; j <= 0.45 * HEIGHT; j += 40) {
            no++;
            let condition = Math.floor(Math.random() * 11) == 10 ? 1 : 0;
            let status = condition == 1 ? "告警" : "正常";
            drawRack(stage, rackGroup, rackLayer, tagGroup, tagLayer, {
                x: i,
                y: j,
                condition: condition,
                hoverText: "编号: " + no + "\n状态: " + status + "\n详细信息: 备注",
                align: 'left'
            });
        }
    }

    for (let i = 0.2 * WIDTH; i <= 0.7 * WIDTH; i += 150) {
        for (let j = 0.55 * HEIGHT; j <= 0.7 * HEIGHT; j += 40) {
            no++;
            let condition = Math.floor(Math.random() * 11) == 10 ? 1 : 0;
            let status = condition == 1 ? "告警" : "正常";
            drawRack(stage, rackGroup, rackLayer, tagGroup, tagLayer, {
                x: i,
                y: j,
                condition: condition,
                hoverText: "编号: " + no + "\n状态: " + status + "\n详细信息: xxx",
                align: 'left'
            });
        }
    }

    // 绘制风扇
    let fanGroup = new Konva.Group();
    let fanLayer = new Konva.Layer();
    drawFan(stage, fanGroup, fanLayer, {
        x: 0.1 * WIDTH,
        y: 0.75 * HEIGHT,
        condition: 0,
        rotate: true,
        angularSpeed: 180,  // one revolution per 2 seconds (2 * 180 = 360)
    });
    drawFan(stage, fanGroup, fanLayer, {
        x: 0.82 * WIDTH,
        y: 0.2 * HEIGHT,
        condition: 1,
        rotate: false,
    });

    // 绘制服务器
    let serverGroup = new Konva.Group();
    let serverLayer = new Konva.Layer();
    drawServer(serverStage, serverGroup, serverLayer, [
        {
            pos: 0,
            name: "应用服务器",
            model: "DELL 2900",
            ip: "192.168.0.1",
        },
        {
            pos: 1,
            name: "应用服务器",
            model: "DELL 2900",
            ip: "192.168.8.6",
        },
        {
            pos: 2,
            name: "应用服务器",
            model: "DELL 2900",
            ip: "192.168.8.8",
        },
        {
            pos: 3,
            name: "应用服务器",
            model: "DELL 2900",
            ip: "192.168.6.6",
        },
        {
            pos: 4,
            name: "应用服务器",
            model: "DELL 2900",
            ip: "192.168.6.8",
        },
        {
            pos: 6,
            name: "应用服务器",
            model: "DELL 2900",
            ip: "192.168.6.8",
        },
        {
            pos: 8,
            name: "应用服务器",
            model: "DELL 2900",
            ip: "192.168.6.8",
        },
        {
            pos: 9,
            name: "应用服务器",
            model: "DELL 2900",
            ip: "192.168.6.8",
        }
    ]);

    // 锁定功能按钮
    document.getElementById("lock").onclick = function () {
        if (this.checked) {
            console.log("编辑状态:开");
            document.getElementById('mainContainer').style.pointerEvents = 'auto';
            grids.layer.visible(true);
            grids.layer.draw();
        } else {
            console.log("编辑状态:关");
            document.getElementById('mainContainer').style.pointerEvents = 'none'
            grids.layer.visible(false);
            grids.layer.draw();
        }
    };
    // 返回功能按钮

    document.getElementById("view").onclick = function () {
        let mainContainer = document.getElementById('mainContainer');
        mainContainer.style.display = 'block';
        let view = document.getElementById('view');
        view.style.visibility = 'hidden';
    }
}

/*==================================================================================================*/
/*==================================================================================================*/
/*==================================================================================================*/

/* 机架 */
function drawRack(stage, rackGroup, rackLayer, tagGroup, tagLayer, options) {
    let x = options.x == undefined ? 0 : options.x;
    let y = options.y == undefined ? 0 : options.y;
    let condition = options.condition == undefined ? 0 : options.condition;
    // 加载资源
    let rack_green = new Image();
    rack_green.src = './images/rack_green.svg';
    let rack = new Image();
    if (condition == 0) {
        rack.src = './images/rack_white.svg';
    } else {
        rack.src = './images/rack_red.svg';
    }
    // 绘制悬停标签
    let tooltip = new Konva.Label({
        x: 0,
        y: 0,
        opacity: 0.9,
        visible: false
    });
    // 标签样式
    tooltip.add(new Konva.Tag({
        fill: '#353446',
        pointerDirection: 'left',
        pointerWidth: 10,
        pointerHeight: 10,
        lineJoin: 'miter',
        stroke: '#55C0D2',
    }));
    // 标签字体
    tooltip.add(new Konva.Text({
        text: options.hoverText,
        fontFamily: 'Calibri',
        fontSize: 18,
        padding: 5,
        fill: '#55C0D2',
        lineHeight: 1.3
    }));
    // 资源加载完成
    rack.onload = function () {
        let theRack = new Konva.Image({
            x: x,
            y: y,
            image: rack,
            width: 40,
            height: 40,
            draggable: true,
            dragDistance: 0,
            name: "draggable",
        });
        rackGroup.add(theRack);
        rackLayer.add(rackGroup);
        stage.add(rackLayer);
        rackLayer.setZIndex(5);
        tagGroup.add(tooltip);
        tagLayer.add(tagGroup);
        stage.add(tagLayer);
        tagLayer.setZIndex(7);
        // 对齐到网格
        snapToGrid(theRack, rackLayer);
        // 事件绑定
        theRack.on('mouseenter', function () {
            stage.container().style.cursor = 'pointer';
            tooltip.x(theRack.x() + 45);
            tooltip.y(theRack.y() + 20);
            tooltip.visible(true);
            tagLayer.draw();
            if (condition == 0) {
                theRack.setImage(rack_green);
                rackLayer.draw();
            }

        });
        theRack.on('mouseleave', function () {
            stage.container().style.cursor = 'default';
            tooltip.visible(false);
            tagLayer.draw();
            if (condition == 0) {
                theRack.setImage(rack);
                rackLayer.draw();
            }
        });
        theRack.on('dragstart', function () {
            tooltip.visible(false);
            tagLayer.draw();
        })
        theRack.on('click', function () {
            let mainContainer = document.getElementById('mainContainer');
            mainContainer.style.display = 'none';
            let view = document.getElementById('view');
            view.style.visibility = 'visible';
        })
    }
}

/* 风扇 */
function drawFan(stage, fanGroup, fanLayer, options) {
    let x = options.x == undefined ? 30 : options.x;
    let y = options.y == undefined ? 30 : options.y;
    let condition = options.condition == undefined ? 0 : options.condition;
    let rotate = options.rotate == undefined ? false : options.rotate;
    let angularSpeed = options.angularSpeed == undefined ? 90 : options.angularSpeed;
    // 加载资源
    let fan = new Image();
    if (condition == 0) {
        fan.src = './images/fan_blue.svg';
    } else {
        fan.src = './images/fan_red.svg';
    }
    // 资源加载完成
    fan.onload = function () {
        let theFan = new Konva.Image({
            x: x,
            y: y,
            image: fan,
            width: 80,
            height: 80,
            draggable: true,
            dragDistance: 0,
            offset: {
                x: 40,
                y: 40,
            },
            name: "draggable"
        });
        fanGroup.add(theFan);
        fanLayer.add(fanGroup);
        stage.add(fanLayer);
        fanLayer.setZIndex(6);
        // 对齐到网格
        snapToGrid(theFan, fanLayer);
        // 绑定事件
        theFan.on('mouseenter', function () {
            stage.container().style.cursor = 'pointer';
            theFan.width(100);
            theFan.height(100);
            theFan.offsetX(50);
            theFan.offsetY(50);
            fanLayer.draw();
        });
        theFan.on('mouseleave', function () {
            stage.container().style.cursor = 'default';
            theFan.width(80);
            theFan.height(80);
            theFan.offsetX(40);
            theFan.offsetY(40);
            fanLayer.draw();
        });
        if (rotate) {
            let anim = new Konva.Animation(function (frame) {
                let angleDiff = frame.timeDiff * angularSpeed / 1000;
                theFan.rotate(angleDiff);
            }, fanLayer);
            anim.start();
        }
    }
}

/* 房间 */
function drawRoomContour(stage) {
    // 初始化参数
    let seats = new Image();
    seats.src = './images/seats.svg';
    let xGap = 80;
    let yGap = 80;
    let outline_breath = 4;
    let line_breath = 3;
    let line_color = "#FFFFFF";
    let contourLayer = new Konva.Layer();
    let group = new Konva.Group({
        x: xGap,
        y: yGap,
    });

    // 设置外边框
    let outline = new Konva.Rect({
        x: 0,
        y: 0,
        width: WIDTH - 2 * xGap,
        height: HEIGHT - 2 * yGap,
        stroke: line_color,
        strokeWidth: outline_breath
    });

    // 设置内部线条
    let line0 = new Konva.Line({
        points: [0, 0.8 * outline.height(), outline.width(), 0.8 * outline.height()],
        stroke: line_color,
        strokeWidth: line_breath,
        lineCap: 'miter',
        lineJoin: 'round'
    });
    let line1 = new Konva.Line({
        points: [0.8 * outline.width(), 0, 0.8 * outline.width(), outline.height()],
        stroke: line_color,
        strokeWidth: line_breath,
        lineCap: 'miter',
        lineJoin: 'round'
    });

    // 主门
    let door0 = new Konva.Rect({
        x: 0.05 * WIDTH,
        y: 0,
        width: 0.1 * WIDTH,
        height: 0.04 * HEIGHT,
        stroke: line_color,
        strokeWidth: outline_breath
    });

    // 会议室
    function getSeats(x, y) {
        return (new Konva.Image({
            x: x,
            y: y,
            image: seats,
            width: 100,
            height: 100,
            draggable: false,
        }));
    }
    seats.onload = function () {
        let theSeats0 = getSeats(0.77 * WIDTH, 0.5 * HEIGHT);
        let theSeats1 = getSeats(0.84 * WIDTH, 0.5 * HEIGHT);
        let theSeats2 = getSeats(0.77 * WIDTH, 0.4 * HEIGHT);
        let theSeats3 = getSeats(0.84 * WIDTH, 0.4 * HEIGHT);
        let theSeats4 = getSeats(0.77 * WIDTH, 0.3 * HEIGHT);
        let theSeats5 = getSeats(0.84 * WIDTH, 0.3 * HEIGHT);
        // 渲染
        group.add(theSeats0);
        group.add(theSeats1);
        group.add(theSeats2);
        group.add(theSeats3);
        group.add(theSeats4);
        group.add(theSeats5);
        group.add(outline);
        group.add(door0);
        group.add(line0);
        group.add(line1);
        contourLayer.add(group);
        stage.add(contourLayer);
        contourLayer.setZIndex(1);
        return { group: group, layer: contourLayer }
    }
}

/* 网格 */
function drawGrids(stage) {
    let gridLayer = new Konva.Layer();
    let group = new Konva.Group();
    for (let i = 10; i < WIDTH; i += 10) {
        let gridLine = new Konva.Line({
            points: [i, 0, i, HEIGHT],
            stroke: "#404040",
            strokeWidth: 1,
            lineJoin: 'mister',
            dash: [12, 2]
        });
        group.add(gridLine);
    }
    for (let i = 10; i < HEIGHT; i += 10) {
        let gridLine = new Konva.Line({
            points: [0, i, WIDTH, i],
            stroke: "#404040",
            strokeWidth: 1,
            lineJoin: 'mister',
            dash: [12, 2]
        });
        group.add(gridLine);
    }
    gridLayer.add(group);
    stage.add(gridLayer);
    gridLayer.setZIndex(0);
    return { group: group, layer: gridLayer }
}

/* 对齐网格 */
function snapToGrid(obj, layer) {
    obj.on('dragend', function () {
        let offsetX = obj.x() % 10;
        let offsetY = obj.y() % 10;
        if (10 - offsetX > offsetX) {
            obj.x(obj.x() - offsetX);
        } else {
            obj.x(obj.x() + (10 - offsetX));
        }
        if (10 - offsetY > offsetY) {
            obj.y(obj.y() - offsetY);
        } else {
            obj.y(obj.y() + (10 - offsetY));
        }
        layer.draw();
    });
}

/* 服务器 */
function drawServer(stage, group, layer, options) {
    let unit = 0.02 * HEIGHT;
    // 地面
    let ground = new Konva.Line({
        points: [0.35 * WIDTH, 0.95 * HEIGHT, 0.35 * WIDTH, 0.92 * HEIGHT,
        0.61 * WIDTH, 0.92 * HEIGHT, 0.61 * WIDTH, 0.95 * HEIGHT,
        ],
        stroke: 'white',
        strokeWidth: 4,
        lineCap: 'round',
        lineJoin: 'round'
    });
    // 机架刻度
    for (let i = 0; i < 42; i++) {
        let scaleLeft = new Konva.Rect({
            x: 0.4 * WIDTH,
            y: 0.9 * HEIGHT - i * unit,
            width: 0.01 * WIDTH,
            height: unit,
            stroke: "white",
            strokeWidth: 2,
        });
        let scaleRight = new Konva.Rect({
            x: 0.55 * WIDTH,
            y: 0.9 * HEIGHT - i * unit,
            width: 0.01 * WIDTH,
            height: unit,
            stroke: "white",
            strokeWidth: 2,
        });
        group.add(scaleLeft);
        group.add(scaleRight);
    }
    // 架顶
    let roof = new Konva.Rect({
        x: 0.4 * WIDTH,
        y: 0.06 * HEIGHT,
        width: 0.16 * WIDTH,
        height: unit,
        stroke: "white",
        strokeWidth: 2
    });


    // 机器信息
    for (let i = 0; i < options.length; i++) {
        let serverInfo = new Konva.Label({
            x: 0.48 * WIDTH,
            y: 0.92 * HEIGHT - 2 * unit - 2 * options[i].pos * (2 * unit),
            opacity: 1,
        });
        serverInfo.add(new Konva.Tag({
            fill: '#353446',
            pointerDirection: 'down', // 方便确定位置
            pointerWidth: 0,
            pointerHeight: 0,
            lineJoin: 'miter',
            stroke: '#55C0D2',
            strokeWidth: 2,
            cornerRadius: 3,
        }));
        serverInfo.add(new Konva.Text({
            width: 0.132 * WIDTH,
            height: 2 * unit,
            align: "center",
            text: options[i].name + " (" + options[i].model + ")",
            fontFamily: 'Calibri',
            fontSize: 18,
            padding: 4,
            fill: '#55C0D2',
            lineHeight: 1.2
        }));
        group.add(serverInfo);
    }
    group.add(ground);
    group.add(roof);
    layer.add(group);
    stage.add(layer);
}
