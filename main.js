const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const sizeSlider = document.getElementById("size")
let bgColor = "black";

let randomColor = () => Math.floor(Math.random()*16777215).toString(16);


const vAdd = (vec1, vec2) => new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);


class Vector2 {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
	
}

class Body {
	acceleration = new Vector2(0,0);
	velocity = new Vector2(0,0);
	position = new Vector2(0,0);
	constructor(x,y, Size) {
		this.position = new Vector2(x,y);
		this.size = Size;
		this.color = randomColor();
	}

	calculateForces() {

	}

	calculatePullTo(other) {

	}


	drawObject() {
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false);
		ctx.fillStyle = "#" + this.color;
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.fill();
	}
}
let bodies = []; // Lista koostuen kaikista piirrettävistä objekteista

const addNewObject = (x,y, size) => {
	bodies.push(new Body(x,y,size));
} 

const draw = () => {
	ctx.clearRect(0,0,1200, 900);
	ctx.fillStyle = bgColor;
	ctx.fillRect(0,0,1200, 900);
	bodies.forEach(obj => obj.drawObject());
};

const update = () => {
				// console.log("Update called")
				// TODO: Update body positions and handle input
};

canvas.onclick = (e) => {
	let rect = canvas.getBoundingClientRect(); 
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	addNewObject(x,y,parseInt(sizeSlider.value));
	console.log(x,y)
}

const frameLogic = () => {
				update();
				draw();
				requestAnimationFrame(frameLogic);
};
window.requestAnimationFrame(frameLogic)
