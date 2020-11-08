const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const sizeSlider = document.getElementById("size")
let bgColor = "black";


const gC = 6.674255 * (10**-11);

const randomColor = () => Math.floor(Math.random()*16777215).toString(16);


const vAdd = (vec1, vec2) => new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);
const vMult = (n, vec) => new Vector2(n * vec.x, n * vec.y);


const vLen = (vec) => Math.sqrt(vec.x**2 + vec.y**2);
const unitV = (vec) => vMult(1/vLen(vec),vec);


class Vector2 {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
}

let placeholder = {
	x: 5000 , y: 5000
};

let drawArrows = false;

class Body {
	acceleration = new Vector2(0,0);
	velocity = new Vector2(0,0);
	position = new Vector2(0,0);
	affectingForces = []
	constructor(x,y, Size, Mass, initialVel) {
		this.velocity = initialVel;
		this.position = new Vector2(x,y);
		this.size = Size;
		this.color = randomColor();
		this.mass = Mass;
		this.calculateForces = this.calculateForces.bind(this);
		this.calculatePullTo = this.calculatePullTo.bind(this);
		this.simulate = this.simulate.bind(this);
		this.applyAcceleration = this.applyAcceleration.bind(this);
		this.applyVelocity = this.applyVelocity.bind(this);
		this.drawObject = this.drawObject.bind(this);
		this.checkForCollision = this.checkForCollision.bind(this);
		this.checkCollisions = this.checkCollisions.bind(this);
	}

	calculateForces() {
		this.affectingForces = bodies.filter(b => b != this).map(this.calculatePullTo);
		if(this.affectingForces.length == 0) {
			return;
		}
		let sF = this.affectingForces.reduce((prev, curr) => vAdd(curr, prev));
		this.acceleration = vMult(1/this.mass,sF);
	}

	applyAcceleration() {
		this.velocity = vAdd(this.velocity, vMult(10000000,this.acceleration));
	}

	applyVelocity() {
		this.position = vAdd(this.position, this.velocity);


	}



	checkForCollision(other) {
		let difference = vAdd(other.position, vMult(-1, this.position));
		let len = vLen(difference);
		return len < this.size*2;

	}

	checkCollisions() {
		bodies.filter(b=>b != this).filter(this.checkForCollision).forEach((body) => {
			// TODO Collision logic...
			console.log("Collision");
		})
	}

	simulate() {
		this.checkCollisions();
		this.calculateForces();
		this.applyAcceleration();
		this.applyVelocity();
	}


	calculatePullTo(other) {
		let m1 = this.mass;
		let m2 = other.mass;
		let r = vAdd(this.position, vMult(-1, other.position));
		let rHat = unitV(r);
		let rLen = vLen(r);
		let multiplier = -gC*((m1*m2)/(rLen**2));
		return vMult(multiplier, rHat);
	}


	drawObject() {
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false);
		ctx.fillStyle = "#" + this.color;
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.fill();
		if(drawArrows) {
			let arrowCoords = vAdd(vMult(100,this.velocity), this.position);
			canvas_arrow(this.position.x, this.position.y, arrowCoords.x, arrowCoords.y);
		}
	}
}
let bodies = []; // Lista koostuen kaikista piirrettävistä objekteista
let placeholders = [];
const addNewObject = (x,y, size, initialVel) => {
	bodies.push(new Body(x,y,size, 1*10*2900, initialVel));
};


function canvas_arrow(fromx, fromy, tox, toy) {
	var headlen = 10; // length of head in pixels
	var dx = tox - fromx;
	var dy = toy - fromy;
	var angle = Math.atan2(dy, dx);
	ctx.beginPath();

	ctx.moveTo(fromx, fromy);
	ctx.lineTo(tox, toy);
	ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
	ctx.moveTo(tox, toy);
	ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
	ctx.stroke();
  }


const draw = () => {
	ctx.clearRect(0,0,1200, 900);
	ctx.fillStyle = bgColor;
	ctx.fillRect(0,0,1200, 900);
	bodies.forEach(obj => obj.drawObject());

	if(mouseDown) {
		ctx.beginPath();
		ctx.arc(placeholder.x, placeholder.y, parseInt(sizeSlider.value), 0, 2 * Math.PI, false);
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.beginPath();

		ctx.arc(startX, startY, parseInt(sizeSlider.value), 0, 2 * Math.PI, false);
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.beginPath();

		canvas_arrow(startX,startY, placeholder.x, placeholder.y);
	}
};

const update = () => {
	bodies.forEach(b => b.simulate());
};

canvas.onclick = (e) => {
	let rect = canvas.getBoundingClientRect(); 
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	//addNewObject(x,y,parseInt(sizeSlider.value));
};

let startX, startY;
let mouseDown = false;
canvas.onmousemove = (e) => {
	let rect = canvas.getBoundingClientRect(); 

	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;

	placeholder.x = x;
	placeholder.y = y;
}

canvas.onmouseup = (e) => {
	mouseDown = false;
	let rect = canvas.getBoundingClientRect(); 

	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	
	let dX = startX - x;
	let dY = startY - y;

	addNewObject(startX,startY,parseInt(sizeSlider.value), vMult(1/250, vMult(-1, new Vector2(dX, dY))));
};

canvas.onmousedown = (e) => {
	mouseDown = true;
	let rect = canvas.getBoundingClientRect(); 
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	startX = x;
	startY = y;
};


const frameLogic = () => {
				update();
				draw();
				requestAnimationFrame(frameLogic);
};
window.requestAnimationFrame(frameLogic)
