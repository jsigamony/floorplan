const canvas = document.getElementById('floorplan');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');


// fetching from json file failing.

// async function loadFloorplanData() {
//     try {
//         console.log("Fetching sampel")
//         const response = await fetch('sample.json'); // Fetch JSON data from the external file
//         const floorplanData = await response.json();
//         drawFloorplan(floorplanData);
//     } catch (error) {
//         console.error('Error loading floorplan data:', error);
//     }
// }


//I had to manually store the sample.json contents as an object since fetching it was giving runtime error.
const floorplanData = {
    "Regions": [
        [
            {"X": 0, "Y": 0, "Z": 52.49343832020996},
            {"X": 38.27436931869327, "Y": 34.868392433523155, "Z": 52.49343832020996}
        ],
        [
            {"X": 0, "Y": 100, "Z": 52.49343832020996},
            {"X": 55.65625908245986, "Y": 34.86839243352309, "Z": 52.49343832020996}
        ],
        [
            {"X": 100, "Y": 100, "Z": 52.49343832020996},
            {"X": 55.656259082459876, "Y": 44.38282812906108, "Z": 52.49343832020996}
        ],
        [
            {"X": 100, "Y": 0, "Z": 52.49343832020996},
            {"X": 38.27436931869315, "Y": 44.38282812906114, "Z": 52.49343832020996}
        ]
    ],
    "Doors": [
        {
            "Location": {"X": 38.11032732394258, "Y": 37.32902235448528, "Z": 52.49343832020996},
            "Rotation": 4.712388980384696,
            "Width": 4.284776902887138
        }
    ],
    "Furnitures": [
        {
            "MinBound": {"X": -10, "Y": -20, "Z": -2.4868995751603507e-14},
            "MaxBound": {"X": 10, "Y": 20, "Z": 2.7887139107611625},
            "equipName": "Equipment 1",
            "xPlacement": 0,
            "yPlacement": 0,
            "rotation": 1.5707963267948966
        },
        {
            "MinBound": {"X": -1.416666666666667, "Y": -1.8501516343696665, "Z": -2.6645352591003757e-15},
            "MaxBound": {"X": 1.4166666666666665, "Y": 1.2500000000000004, "Z": 7.083333333333304},
            "equipName": "Equipment 2",
            "xPlacement": 39.69103598405127,
            "yPlacement": 42.96309243717516,
            "rotation": 3.141592653589793
        },
        {
            "MinBound": {"X": -0.6118766404199494, "Y": -1.2729658792650858, "Z": -4.440892098500626e-16},
            "MaxBound": {"X": 0.6118766404199577, "Y": 0.6364829396325504, "Z": 3.2972440944882178},
            "equipName": "Equipment 3",
            "xPlacement": 42.64820625787592,
            "yPlacement": 43.86914569417966,
            "rotation": 3.141592653589793
        }
    ]
};

//defining variables that are normally used in javascript canvas 

let scale = 3;
let offsetX = 350;
let offsetY = 250;
let isDragging = false;
let lastX, lastY;

function drawFloorplan() {

    //clearing the floor plan
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw regions (walls)
    ctx.beginPath();

    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;

    floorplanData.Regions.forEach(region => {
        ctx.moveTo(region[0].X * scale + offsetX, region[0].Y * scale + offsetY);
        ctx.lineTo(region[1].X * scale + offsetX, region[1].Y * scale + offsetY);
        // ctx.lineWidth = region[0].Z
    });
    ctx.stroke();

    // Draw doors
    ctx.strokeStyle = '#964B00';

    floorplanData.Doors.forEach(door => {

        let door_x = door.Location.X * scale + offsetX;
        let door_y = door.Location.Y * scale + offsetY;
        let door_w = door.Width * scale;
        ctx.save();
        // ctx.rect(door_x, door_y, door.Location.Z, door.Location.Z);
        // ctx.translate(door_x, door_y);
        // ctx.rotate(door.Rotation);
        ctx.strokeRect(door_x, door_y, door_w/2, door_w);
        // ctx.restore();
    });
    

    ctx.fillStyle = '#0f0';
    floorplanData.Furnitures.forEach(furniture => {
        const x = furniture.xPlacement * scale + offsetX;
        const y = furniture.yPlacement * scale + offsetY;

        // Define width and height variables
        let width, height;

       
        if (furniture.equipName === "Equipment 1") {
            // reducing the size of equipment 1 to make it seem adjusted as compared to the others 
            width = (furniture.MaxBound.X - furniture.MinBound.X)  * 0.9;
            height = (furniture.MaxBound.Y - furniture.MinBound.Y)  * 0.9;
        } else {
            // For other equipment, we calculate it normally
            width = (furniture.MaxBound.X - furniture.MinBound.X) * scale ;
            height = (furniture.MaxBound.Y - furniture.MinBound.Y) * scale;
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(furniture.rotation);
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.restore();
    });


};

function handleMouseDown(e) {
    isDragging = true;

    //getting the last known position of the mouse
    lastX = e.clientX - canvas.getBoundingClientRect().left;
    lastY = e.clientY - canvas.getBoundingClientRect().top;
}

function handleMouseMove(e) {

    const rect = canvas.getBoundingClientRect(); //gives position of the mouse relative to the parent canvas
    console.log(rect) //printing to test the mouse position

    //getting the mouse x and y cooridnates on the cnavas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {

        // moving the floorplan diagram accordingly to the lastX and lastY 
        offsetX += mouseX - lastX;
        offsetY += mouseY - lastY;

        lastX = mouseX;
        lastY = mouseY;
        drawFloorplan();
    }

    // Check if mouse is over furniture
    let hoveredFurniture = null;
    floorplanData.Furnitures.forEach(furniture => {

        //getting the positions of the furniture items
        const x = furniture.xPlacement * scale + offsetX;
        const y = furniture.yPlacement * scale + offsetY;
        
        const width = (furniture.MaxBound.X - furniture.MinBound.X) * scale;
        const height = (furniture.MaxBound.Y - furniture.MinBound.Y) * scale;

        //the x and y coordinates are just dots 
        //checking if the mouse is within the boundaries from both x nd y side
        if (
            (mouseX > x - width / 2) && (mouseX < x + width / 2) && (mouseY > y - height / 2) && (mouseY < y + height / 2)
        ) {
            hoveredFurniture = furniture;
        }
    });

    if (hoveredFurniture) {
        tooltip.style.display = 'block';
        tooltip.textContent = hoveredFurniture.equipName;
    } else {
        tooltip.style.display = 'none';
    }
}

function handleMouseUp() {
    isDragging = false;
}

//to adjust the floorplan zoom 
function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale *= delta;
    offsetX = e.clientX - (e.clientX - offsetX) * delta;
    offsetY = e.clientY - (e.clientY - offsetY) * delta;
    drawFloorplan();
}

canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('wheel', handleWheel);

drawFloorplan();