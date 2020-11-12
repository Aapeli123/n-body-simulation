const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const sizeSlider = document.getElementById("size");
const massSlider = document.getElementById("mass");

const bg = document.querySelector('#bg');

let bgColor = "#000000";
let pathColor = "#ffffff";

let pathLen = 500;
let showTrails = true;
let paused = false;
let drawArrows = true;
let showBg = true;

let bodies = []; // Lista koostuen kaikista piirrettävistä objekteista

const gC = 6.674255 * (10**-11);

const randomColor = () => Math.floor(Math.random()*16777215).toString(16);


class Vector2 {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
}
const vAdd = (vec1, vec2) => new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);
const vMult = (n, vec) => new Vector2(n * vec.x, n * vec.y);
const vLen = (vec) => Math.sqrt(vec.x**2 + vec.y**2);
const unitV = (vec) => vMult(1/vLen(vec),vec);



let placeholder = {
	x: 5000 , y: 5000
};

const select = (name) => {
	selected = name;
}


class Body {
	acceleration = new Vector2(0,0);
	velocity = new Vector2(0,0);
	position = new Vector2(0,0);
	affectingForces = []
	trail = [];
	constructor(x,y, Size, Mass, initialVel, color) {
		if(typeof x == "object") { // Tän ei pitäis olla näin, mut javascript ei tue operator overloadingii...
			let obj = x;
			this.position = obj.position;
			this.velocity = obj.velocity;
			this.acceleration = obj.acceleration;
			this.size = obj.size; 
			this.mass = obj.mass;
			this.affectingForces = obj.affectingForces
			this.color = obj.color;
		} else {
			this.velocity = initialVel;
			this.position = new Vector2(x,y);
			this.size = Size;
			this.color = color;
			this.mass = Mass;
		}

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
			this.acceleration = new Vector2(0,0);
			return
		}
		let sF = this.affectingForces.reduce((prev, curr) => vAdd(curr, prev));
		this.acceleration = vMult(1/this.mass,sF);
	}

	applyAcceleration() {
		this.velocity = vAdd(this.velocity, vMult(1/100000000000,this.acceleration)); // Multiply by low number so the bodies don't go out of bounds
	}

	applyVelocity() {
		this.position = vAdd(this.position, this.velocity);
		if(showTrails) {
			this.trail.push(this.position);
			if(this.trail.length > pathLen) {
				this.trail.shift();
			}
		} else {
			this.trail = [];
		}

	}



	checkForCollision(other) {
		let difference = vAdd(other.position, vMult(-1, this.position));
		let len = vLen(difference);
		if(len < this.size + other.size) {
			let bIndex = bodies.findIndex(e => e == other);
			let otherMass = other.mass;
			if(otherMass > this.mass) {
				return false
			}
			let p1 = vMult(this.mass, this.velocity);
			let p2 = vMult(otherMass, other.velocity);
			let pSum = vAdd(p1, p2);
			let massSum = this.mass + other.mass;
			let newVel = vMult(1/massSum,pSum)
			this.velocity = newVel

			this.mass += other.mass;
			
			
			// Ratkaise pinta alat ja laske niiden kautta uuden kappaleen pinta-ala ja säde
			let area1 = Math.PI * this.size**2;
			let area2 = Math.PI * other.size**2;
			let newArea  = area1 + area2;
			
			let newSize = Math.cbrt(this.size**3 + other.size**3) // Math.sqrt(newArea/Math.PI); // jaettuna kahdelle osa materiaalista katoaa
			this.size = newSize;

			
			bodies.splice(bIndex, 1);
			console.log(bodies)
		}
		return len < this.size + other.size;

	}

	checkCollisions() {
		bodies.filter(b=>b != this).filter(this.checkForCollision).forEach((body) => {
			// TODO Collision logic...
			console.log(this, "collided with", body);
		})
	}

	simulate() {
		this.calculateForces();
		this.applyAcceleration();
		this.applyVelocity();
		this.checkCollisions();
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
			let arrowCoords = vAdd(vMult(70,this.velocity), this.position);
			canvas_arrow(this.position.x, this.position.y, arrowCoords.x, arrowCoords.y);
		}
	}


	drawTrail() {
		ctx.beginPath();
		ctx.strokeStyle =  "#"+ this.color;
		this.trail.forEach(p => {
			ctx.lineTo(p.x, p.y);
			ctx.moveTo(p.x, p.y);
		})
		ctx.stroke();
	}
}


const Earth = (x,y, initialVel) => new Body(x,y, 63.71, 5.972*(10**24), initialVel, "0000FF");
const Moon = (x,y, initialVel) => new Body(x,y, 1.737, 7.34767309*(10**22), initialVel, "444444");

let selected = "custom";

let selectable = {
	"Earth": Earth,
	"Moon": Moon
}

const addNewObject = (x,y, size, initialVel) => {
	if(selected == "custom") {
		bodies.push(new Body(x,y,size, parseFloat(massSlider.value)*10**24, initialVel, randomColor()));
	} else {
		bodies.push(selectable[selected](x,y,initialVel))
	}
};


const canvas_arrow = (fromx, fromy, tox, toy) => {
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

const drawPlaceholder = (size) => {
	ctx.beginPath();
	ctx.arc(placeholder.x, placeholder.y, size, 0, 2 * Math.PI, false);
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.beginPath();

	ctx.arc(startX, startY, size, 0, 2 * Math.PI, false);
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.beginPath();
	canvas_arrow(startX,startY, placeholder.x, placeholder.y);

}


const draw = () => {
	ctx.clearRect(0,0,2000, 1000);
	ctx.fillStyle = bgColor;
	
	if (showBg) {
		ctx.drawImage(bg,0,0,2000, 1000);
	} else {
		ctx.fillRect(0,0,2000, 1000);
	}

	bodies.forEach(obj => {obj.drawTrail(); obj.drawObject()});


	ctx.font = "30px Arial";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(`FPS: ${fps.toPrecision(2)}`, 100, 100);
	if(paused) {
		ctx.font = "30px Arial";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText("Paused", 25, 50);
	}


	if(mouseDown) {
		if(selected == "custom") {
			drawPlaceholder(parseInt(sizeSlider.value));
		} else {
			drawPlaceholder(selectable[selected]().size);
		}
	}
};

const update = () => {
	bodies.forEach(b => b.simulate());
	bodies = bodies.filter(b => {
		return !(b.x < -1000 || b.y < -1000 || b.x > 2000 || b.y > 2000); 
	});
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

	addNewObject(startX,startY,parseInt(sizeSlider.value), vMult(1/100, vMult(-1, new Vector2(dX, dY))));
};

canvas.onmousedown = (e) => {
	mouseDown = true;
	let rect = canvas.getBoundingClientRect(); 
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	startX = x;
	startY = y;
};

const exportSimulation = () => btoa(JSON.stringify(bodies.map(m => {m.trail = [];return m})));
const importSimulation = (simStr) => {
	bodies = JSON.parse(atob(simStr)).map(o => new Body(o));
}
let prevTime = performance.now();
let fps = 0;
const frameLogic = (t) => {
	let time = performance.now();
	let dt = time - prevTime; // Time since last frame
	fps = 1000/dt;
	if(!paused) {
		update();
	}
	draw();
	prevTime = time;
	requestAnimationFrame(frameLogic);
};


window.requestAnimationFrame(frameLogic);