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


class Body {
	acceleration = new Vector2(0,0);
	velocity = new Vector2(0,0);
	position = new Vector2(0,0);
	affectingForces = []
	constructor(x,y, Size, Mass) {
		this.position = new Vector2(x,y);
		this.size = Size;
		this.color = randomColor();
		this.mass = Mass;
	}

	calculateForces() {
		this.affectingForces = [];
		// F = newtonin painovoimalaki
		// a = F/m
		// velocity = vAdd(a, velocity);
	}

	calculatePullTo(other) {
		let m1 = this.mass;
		let m2 = other.mass;
		let r = vAdd(this.position, vMult(-1, other.position));
		let rHat = unitV(r);
		let rLis = vLen(r);
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
	}
}
let bodies = []; // Lista koostuen kaikista piirrettävistä objekteista

const addNewObject = (x,y, size) => {
	bodies.push(new Body(x,y,size));
};


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
	// console.log(x,y)
}

const frameLogic = () => {
				update();
				draw();
				requestAnimationFrame(frameLogic);
};
window.requestAnimationFrame(frameLogic)
