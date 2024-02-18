// import {screenWidth, screenHeight, settings} from "./settings.js"
const canvas = document.getElementById("soccerField");
const ctx = canvas.getContext("2d");
const screenWidth = 1880;
const screenHeight = 1008;
var screens = ["Home", "Soccer Field", "Shop", "Settings"]
var screenId = 1;
var characters = [];
var std_procedures = 0;
var settings = {
  playerSize: Math.sqrt(screenWidth * screenHeight) * 0.01,
  computerSize: Math.sqrt(screenWidth * screenHeight) * 0.01,
  ballSize: Math.sqrt(screenWidth * screenHeight) * 0.01,
  playerThrust: 0.01,
  computerThrust: 0.26,
  playerMass: 1,
  computerMass: 1,
  ballMass: 0.01,
  friction: 0.25,
  restitution: 0.8
}
function dist(x1,y1,x2,y2){
  return Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1));
}
function restore(screen){
  if (screen === 0){
    const fieldBackground = ctx.createLinearGradient(0, 0, screenWidth, 0);
    fieldBackground.addColorStop(0, "black");
    fieldBackground.addColorStop(1, "green");
    ctx.fillStyle = fieldBackground;
    ctx.fillRect(0, 0, screenWidth, screenHeight)
    ctx.font = "13vw Courier New";
    ctx.strokeStyle = "white";
    ctx.strokeText("S⚽ccer 2024", 0, screenHeight * 0.2);
    ctx.font = "1vw Courier New";
    button(0,screenHeight * 0.2,screenWidth * 0.05,screenHeight * 0.05,"Sign In","black","white","white","auto",signIn);
    button(0,screenHeight * 0.2 + 17,screenWidth * 0.05,screenHeight * 0.05,"Log In","black","white","white","auto",logIn);
  }
  else if (screen === 1){ 
    function createCharacter(id, name, role, color, size, mass){
      var character = {
        id: id,
        name: name,
        role: role,
        color: color,
        size: size,
        show: true,
        mass: mass,
        s: {
          x: 0, y: 0
        },
        v: {
          x: 0, y: 0
        },
        a: {
          x: 0, y: 0
        },
        forces: []
      }
      characters.push(character);
    }
    function drawCharacter(char){
      if (char.show === true){
        ctx.fillStyle = char.color;
        ctx.beginPath();
        ctx.arc(char.s.x, char.s.y, char.size, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    function drawCharacters(chars){
      chars.forEach(drawCharacter);
    }
    function updateCharacter(char){
      char.s.x += char.v.x;
      char.s.y += char.v.y;
      if (char.name == "Player"){
      window.addEventListener("keydown",(e)=>{
        if (e.key === "ArrowRight" && char.forces.includes({name:"thrust_r",x:settings.playerThrust,y:0}) == false){
            char.forces.push({name:"thrust_r",x:settings.playerThrust,y:0})
        }
        if (e.key === "ArrowLeft" && char.forces.includes({name:"thrust_l",x:-settings.playerThrust,y:0}) == false){
            char.forces.push({name:"thrust_l",x:-settings.playerThrust,y:0})
        }
        if (e.key === "ArrowUp" && char.forces.includes({name:"thrust_u",x:0,y:-settings.playerThrust}) == false){
            char.forces.push({name:"thrust_u",x:0,y:-settings.playerThrust})
        }
        if (e.key === "ArrowDown" && char.forces.includes({name:"thrust_d",x:0,y:settings.playerThrust}) == false){
            char.forces.push({name:"thrust_d",x:0,y:settings.playerThrust})
        }
      });
      }
      char.forces.push({name:"friction",x:0,y:0})
      if (char.v.x != 0 && char.v.y != 0){
        getForceByName(char.forces,"friction").x = -settings.friction * char.v.x / Math.sqrt(char.v.x ** 2 + char.v.y ** 2) * char.mass;
        getForceByName(char.forces,"friction").y = -settings.friction * char.v.y / Math.sqrt(char.v.x ** 2 + char.v.y ** 2) * char.mass;
      }
      function soccer_ai(char){
        //b is the ball, c is the CPU
        var ideal_x_1, ideal_y_1, ideal_x_2, ideal_y_2, mode;
        mode = 2;
        if (getForceByName(getCharById(characters,"b_0").forces,"friction") != undefined){
          var {x:bfx, y:bfy} = getForceByName(getCharById(characters,"b_0").forces,"friction");
        }
        else {
          let bfx = 0;
          let bfy = 0;
        }
        let {x:bx, y:by} = getCharById(characters,"b_0").s;
        let {x:bvx, y:bvy} = getCharById(characters,"b_0").v;
        let {x:cx, y:cy} = getCharById(characters,"c_0").s;
        let {x:px, y:py} = getCharById(characters,"p_0").s;
        let {x:pvx, y:pvy} = getCharById(characters,"p_0").v;
        if (getForceByName(getCharById(characters,"p_0").forces,"friction") != undefined){
          let {x:pfx, y:pfy} = getForceByName(getCharById(characters,"p_0").forces,"friction");
        }
        else {
          let pfx, pfy = 0;
        }
        let br = getCharById(characters,"b_0").size;
        let cr = getCharById(characters,"c_0").size;
        let bm = getCharById(characters,"b_0").mass;
        let pm = getCharById(characters,"p_0").mass;
        let d = cr+br;
        //Case 2 - Aiming Part
        if (mode == 2){
          let a = (bx-cx)**2-d**2;
          let b = -2*(bx-cx)*(by-cy)
          let c = (by-cy)**2-d**2
          let root1 = (-b+Math.sqrt(Math.abs(b**2-4*a*c)))/(2*a);
          let root2 = (-b-Math.sqrt(Math.abs(b**2-4*a*c)))/(2*a);
          ideal_x_2 = Math.max((screenHeight/2-cy+root1*cx)/(root1-(by-screenHeight/2)/bx),(screenHeight/2-cy+root2*cx)/(root2-(by-screenHeight/2)/bx));
          ideal_y_2 = ((by-screenHeight/2)/bx)*(ideal_x_2-bx)+by;
          let ideal_line_dist=Math.abs((by-screenHeight/2)/bx*cx-cy+screenHeight/2)/Math.sqrt(1+((by-screenHeight/2)/bx)**2)
           if (ideal_line_dist <= d){//special case, that is, when the ball, CPU and goal are collinear or nearly collinear, in this case the CPU should not head for the ideal point, it should move away from the line so that the three are not collinear
             getCharById(characters,"c_0").forces.push({name:"ai_thrust",x:-settings.computerThrust/Math.sqrt(1+(bx/(screenHeight/2-by))**2),y:-settings.computerThrust*(bx/(screenHeight/2-by))/Math.sqrt(1+(bx/(screenHeight/2-by))**2)})
           }
          else{
            getCharById(characters,"c_0").forces.push({name:"ai_thrust",x:settings.computerThrust*(ideal_x_2-cx)/Math.sqrt((ideal_x_2-cx)**2+(ideal_y_2-cy)**2),y:settings.computerThrust*(ideal_y_2-cy)/Math.sqrt((ideal_x_2-cx)**2+(ideal_y_2-cy)**2)})
            console.log({x: Math.abs(ideal_x_2-cx), y: Math.abs(ideal_y_2-cy)})
          }
          ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(ideal_x_2, ideal_y_2,5, 0, 2 * Math.PI);
        ctx.fill();
          if (ideal_x_2 < 0 || ideal_x_2 > screenWidth || ideal_y_2 < 0 || ideal_y_2 > screenHeight){
            ideal_x_2 = bx;
            ideal_y_2 = by;
          }
          /*if (Math.round(getCharById(characters,"c_0").s.x) == Math.round(ideal_x_2) && Math.round(getCharById(characters,"c_0").s.y) == Math.round(ideal_y_2)){
            
          }*/
          /*console.log(cx-ideal_x_2,cy-ideal_y_2);
          char.forces.push({name:"friction",x:0,y:0})
          if (char.v.x != 0 && char.v.y != 0){
            let forceSumX, forceSumY = 0
            for (i = 0; i < char.forces.length; i++){
              forceSumX += char.forces[i].x;
              forceSumY += char.forces[i].y;
            }
            if (forceSumX < -settings.friction * char.v.x / Math.sqrt(char.v.x ** 2 + char.v.y ** 2) * char.mass){
              getForceByName(char.forces,"friction").x = forceSumX;
            }
            else {
            getForceByName(char.forces,"friction").x = -settings.friction * char.v.x / Math.sqrt(char.v.x ** 2 + char.v.y ** 2) * char.mass;
            }
            if (forceSumY < -settings.friction * char.v.y / Math.sqrt(char.v.x ** 2 + char.v.y ** 2) * char.mass){
              getForceByName(char.forces,"friction").y = forceSumY;
            }
            else {
            getForceByName(char.forces,"friction").y = -settings.friction * char.v.y / Math.sqrt(char.v.x ** 2 + char.v.y ** 2) * char.mass;
            }
          }*/
        }        
        if (mode == 1){
          ideal_x_1 = screenWidth-cr;
          let predicted_y;
          if (-(bvx**2)/(2*bfx) >= screenWidth-br-bx){
            //The ball will hit the right edge if unblocked
            predicted_y = bvy*(screenWidth-br-bx)/bvx+1/2*bfy*(((screenWidth-br-bx)/bvx)**2)+by;
            if (predicted_y >= screenHeight * 19/40 && predicted_y <= screenHeight * 21/40){
              //The ball will enter the goal if unblocked
              ideal_y_1 = (predicted_y-by)/(screenWidth-br-bx)*(ideal_x_1-bx)+by;
            }
            else {
              if (px < bx){
                //eps is expectedPlayerSpeed, ebs is expectedBallSpeed
                let eps = Math.sqrt(pvx**2+2*((settings.playerThrust-settings.friction*pm)/2)*(bx-px))
                let ebs;
                let timeNeeded = (eps-pvx)/((settings.playerThrust-settings.friction*pm)/2);
                let ballHaltXTime = Math.abs(bvx/(settings.friction*bm))
                let ballHaltYTime = Math.abs(bvy/(settings.friction*bm))
                if (ballHaltXTime < timeNeeded){
                  ebs = ((settings.restitution + 1)*eps)/(bm/pm+1)
                }
                else {
                  ebs = ((settings.restitution + 1)*eps+(bm/pm-settings.restitution)*(bvx-Math.sign(bvx)*settings.friction*bm*timeNeeded))/(bm/pm+1)
                }
                ideal_y_1 = bvy/ebs*(screenWidth-cr-bx)+by;
              }
              else {
                if (predicted_y-screenHeight*19/40 < 0){
                  ideal_y_1 = screenHeight * 19/40;
                }
                else if (screenHeight*21/40-predicted_y < 0){
                  ideal_y_1 = screenHeight * 21/40
                }
              }
            }
          }
          else {
            if (by >= screenHeight * 19/40 && by <= screenHeight * 21/40){
              ideal_y_1 = by;
            }
            else {
              ideal_y_1 = Math.min(by-screenHeight*19/40,screenHeight*21/40-by)
            }
          }
          getCharById(characters,"c_0").forces.push({name:"ai_thrust",x:settings.computerThrust*(ideal_x_1-cx)/Math.sqrt((ideal_x_1-cx)**2+(ideal_y_1-cy)**2),y:settings.computerThrust*(ideal_y_1-cy)/Math.sqrt((ideal_x_1-cx)**2+(ideal_y_1-cy)**2)})
        }
      }
      if (char.name == "CPU"){
        soccer_ai(char);
      }
      for (var i = 0; i < char.forces.length; i++){
        char.a.x += char.forces[i].x / char.mass;
        char.a.y += char.forces[i].y / char.mass;
      }
      char.v.x += char.a.x;
      char.v.y += char.a.y;
      char.a.x = 0;
      char.a.y = 0;
      char.forces = [];
      function detectWallCollision(char){
        if (char.s.x > screenWidth - char.size || char.s.x < char.size){
          char.v.x *= -1;
        }
        if (char.s.y > screenHeight - char.size || char.s.y < char.size){
          char.v.y *= -1;
        }
      }
      function detectCharCollision(chars,char){
        for (var i = 0; i < chars.length; i++){
          if (chars.indexOf(char) != i){
            if (dist(char.s.x,char.s.y,chars[i].s.x,chars[i].s.y) < char.size + chars[i].size){
              var tempx, tempy;
              tempx = ((settings.restitution + 1) * chars[i].v.x + (char.mass / chars[i].mass - settings.restitution) * char.v.x)/(char.mass/chars[i].mass + 1)
              chars[i].v.x = ((settings.restitution + 1) * char.v.x + (chars[i].mass / char.mass - settings.restitution) * chars[i].v.x)/(chars[i].mass/char.mass + 1)
              char.v.x = tempx;
              tempy = ((settings.restitution + 1) * chars[i].v.y + (char.mass / chars[i].mass - settings.restitution) * char.v.y)/(char.mass/chars[i].mass + 1)
              chars[i].v.y = ((settings.restitution + 1) * char.v.y + (chars[i].mass / char.mass - settings.restitution) * chars[i].v.y)/(chars[i].mass/char.mass + 1)
              char.v.y = tempy;
            }
          }
        }
      }
      /*function estPlayerReachTime(char){
        var accel = Math.sign(getCharById(characters,"b_0").s.x - char.s.x) * settings.playerThrust;
        if ((-char.v.x + Math.sqrt(char.v.x * char.v.x + 2 * accel * (getCharById(characters,"b_0").s.x - char.s.x)))/accel >= 0){
          return (-char.v.x + Math.sqrt(char.v.x * char.v.x + 2 * accel * (getCharById(characters,"b_0").s.x - char.s.x)))/accel;
        }
        else {
          return (-char.v.x - Math.sqrt(char.v.x * char.v.x + 2 * accel * (getCharById(characters,"b_0").s.x - char.s.x)))/accel;
        }
      }*/
      detectWallCollision(char);
      detectCharCollision(characters,char)
    }
    function updateCharacters(chars){
      chars.forEach(updateCharacter);
      drawCharacters(characters);
    }
    function getCharById(characters,id){
      for (var i = 0; i < characters.length; i++){
        if (characters[i].id == id){
          return characters[i];
        }
      }
    }
    function getForceByName(fs,name){
      for (var i = 0; i < fs.length; i++){
        if (fs[i].name == name){
          return fs[i];
        }
      }
    }
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    ctx.strokeStyle = "white";
    ctx.moveTo(screenWidth * 0.5,0);
    ctx.lineTo(screenWidth * 0.5, screenHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(screenWidth * 0.5, screenHeight * 0.5, Math.sqrt(screenWidth / 60 * 8 * screenHeight / 40 * 8), 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(0, screenHeight * 16 / 40, screenWidth * 4 / 60, screenHeight * 8 / 40);
    ctx.rect(screenWidth * 56 / 60, screenHeight * 16 / 40, screenWidth * 4 / 60, screenHeight * 8 / 40);
    ctx.rect(0, screenHeight * 8 / 40, screenWidth * 12 / 60, screenHeight * 24 / 40);
    ctx.rect(screenWidth * 48 / 60, screenHeight * 8 / 40, screenWidth * 12 / 60, screenHeight * 24 / 40);
    ctx.stroke();
    for (var i = 0; i < screenWidth / 2; i++){
      ctx.strokeStyle = "rgb(" + (255 - (255 * 2 * i / screenWidth)) + "," + (255 - (127 * 2 * i / screenWidth)) + "," + (255 - (255 * 2 * i / screenWidth)) + ")"
      ctx.beginPath();
      ctx.moveTo(i,screenHeight * 19 / 40);
      ctx.lineTo(i + 1,screenHeight * 19 / 40);
      ctx.moveTo(screenWidth - i,screenHeight * 19 / 40);
      ctx.lineTo(screenWidth - (i + 1),screenHeight * 19 / 40);
      ctx.moveTo(i,screenHeight * 21 / 40);
      ctx.lineTo(i + 1,screenHeight * 21 / 40);
      ctx.moveTo(screenWidth - i,screenHeight * 21 / 40);
      ctx.lineTo(screenWidth - (i + 1),screenHeight * 21 / 40);
      ctx.stroke();
    }
    if (std_procedures == 0){
      createCharacter("p_0", "Player", "player", "red", settings.playerSize,settings.playerMass);
      getCharById(characters,"p_0").s.x = settings.playerSize;
      getCharById(characters,"p_0").s.y = screenHeight / 2;
      createCharacter("c_0", "CPU", "cpu", "blue", settings.computerSize,settings.computerMass);
      getCharById(characters,"c_0").s.x = Math.random() * (screenWidth-2*getCharById(characters,"c_0").size)+getCharById(characters,"c_0").size;;
      getCharById(characters,"c_0").s.y = Math.random() * (screenHeight-2*getCharById(characters,"c_0").size)+getCharById(characters,"c_0").size;
      createCharacter("b_0", "Ball", "ball", "white", settings.ballSize,settings.ballMass);
      getCharById(characters,"b_0").s.x = Math.random() * (screenWidth-2*getCharById(characters,"b_0").size)+getCharById(characters,"b_0").size;
      getCharById(characters,"b_0").s.y = Math.random() * (screenHeight-2*getCharById(characters,"b_0").size)+getCharById(characters,"b_0").size;
      /*getCharById(characters,"c_0").s.x = Math.random() * (screenWidth-2*getCharById(characters,"c_0").size)+getCharById(characters,"c_0").size;
      getCharById(characters,"c_0").s.y = Math.random() * (screenHeight-2*getCharById(characters,"c_0").size)+getCharById(characters,"c_0").size;
      getCharById(characters,"b_0").s.x = Math.random() * (screenWidth-2*getCharById(characters,"b_0").size)+getCharById(characters,"b_0").size;
      getCharById(characters,"b_0").s.y = Math.random() * (screenHeight-2*getCharById(characters,"b_0").size)+getCharById(characters,"b_0").size;*/
      std_procedures = 1;
    }
    updateCharacters(characters);
  }
  else if (screen === 2){
    ctx.font = "1vw Courier New";
    ctx.strokeStyle = "black";
    ctx.strokeText("Shop", 0, 17);
    ctx.strokeText("Items available:", 0, 2 * 17)
    ctx.strokeText("Soccer ball ($0.15)", 0, 3 * 17)
    ctx.strokeText("Replacement player ($0.25)", 0, 4 * 17)
    ctx.strokeText("Black oil ($0.20)", 0, 5 * 17)
    ctx.strokeText("Gun ($0.30)", 0, 6 * 17)
  }
  else if (screen === 3){
    ctx.font = "1vw Courier New";
    ctx.strokeStyle = "black";
    ctx.strokeText("Settings", 0, 17)
    ctx.strokeText("CPU level:", 0, 2 * 17)
    ctx.strokeText("Duration per match:", 0, 3 * 17)
    ctx.strokeText("Record: On/Off", 0, 4 * 17)
    ctx.strokeText("Speed:", 0, 5 * 17)
  }
}
function container(x,y,width,height,fillColour,borderColour){
  ctx.fillStyle = fillColour;
  ctx.strokeStyle = borderColour;
  ctx.fillRect(x,y,width,height);
  ctx.strokeRect(x,y,width,height);
}
function button(x, y, width, height, text, buttonColour, borderColour, textColour, autoFit, func){
  ctx.fillStyle = buttonColour;
  ctx.strokeStyle = borderColour;
  if (autoFit === "auto"){
    ctx.fillRect(x,y,text.length * 11.5,text.split(/\n/).length * 17);
    ctx.strokeRect(x,y,text.length * 11.5,text.split(/\n/).length * 17);
    width = text.length * 11.5;
    height = 17;
  }
  else {
    ctx.fillRect(x,y,width,height);
    ctx.strokeRect(x,y,width,height);
  }
  ctx.strokeStyle = textColour;
  ctx.strokeText(text,x,y + 12);
  canvas.addEventListener("click",(e)=>{
    if (x <= e.clientX && e.clientX <= x + width && y <= e.clientY && e.clientY <= y + height){
      func()
    }
  });
}
var objects = [];
var signIn_textBoxes = ["Real Name", "Age", "Username", "Password"];
var logIn_textBoxes = ["logIn-Username", "logIn-Password"];
objects.push({name: "Real Name", text: " "}, {name: "Age", text: " "}, {name: "Username", text: " "}, {name: "Password", text: " "}, {name: "logIn-Username", text: " "}, {name: "logIn-Password", text: " "})
function indexOfText(name, array){
  for (var i = 0; i < array.length; i++){
    if (array[i].name === name){
      return i;
    }
  }
}
var textBoxGroup = "";
function textBox(x,y,width,height,text,boxColour,borderColour,textColour,autoFit,object){
  function updateTextBox(){
    ctx.fillStyle = boxColour;
    ctx.strokeStyle = borderColour;
    if (autoFit === "auto"){
      ctx.fillRect(x,y,text.length * 11.5,text.split(/\n/).length * 17);
      ctx.strokeRect(x,y,text.length * 11.5,text.split(/\n/).length * 17);
      width = text.length * 11.5;
      height = 17;
    }
    else {
      ctx.fillRect(x,y,width,height);
      ctx.strokeRect(x,y,width,height);
    }
    ctx.strokeStyle = textColour;
    ctx.strokeText(text,x,y + 12);
  }
  updateTextBox();
  var clicked = 0;
  canvas.addEventListener("click",(e)=>{
    if (x <= e.clientX && e.clientX <= x + width && y <= e.clientY && e.clientY <= y + height){
      if ((textBoxGroup === "signIn" && signIn_textBoxes.includes(object.name)) || (textBoxGroup === "logIn" && logIn_textBoxes.includes(object.name))){
        clicked = 1;
      }
    }
    else {
      clicked = 0;
    }
  });
  window.addEventListener('keydown', (e)=> {
    if (clicked === 1){
    if (e.key.charCodeAt(0) >= 33 && e.key.length === 1){
      text += (e.key);
      objects[indexOfText(object.name, objects)].text = text;
      updateTextBox();
    }
    if (e.key == "Backspace"){
      var text2 = "";
      for (var a = 0; a < text.length - 1; a++){
        text2 += text[a];
      }
      text = text2;
      objects[indexOfText(object.name, objects)].text = text;
      if (textBoxGroup === "signIn"){
        container(screenWidth * 0.25, screenHeight * 0.25, screenWidth * 0.50, screenHeight * 0.50, "white", "black");
        button(0.25 * screenWidth, 0.25 * screenHeight, 500,500,"Real Name:", "black", "white", "white", "auto")
        textBox(0.25 * screenWidth + 10 * 11.5,0.25 * screenHeight,500,500,objects[indexOfText("Real Name", objects)].text,"black","white","white","auto", {name: "Real Name", text: objects[indexOfText("Real Name", objects)].text})
        button(0.25 * screenWidth, 0.25 * screenHeight + 17, 500,500,"Age:", "black", "white", "white", "auto")
        textBox(0.25 * screenWidth + 4 * 11.5,0.25 * screenHeight + 17,500,500,objects[indexOfText("Age", objects)].text,"black","white","white","auto", {name: "Age", text: objects[indexOfText("Age", objects)].text})
        button(0.25 * screenWidth, 0.25 * screenHeight + 2 * 17, 500,500,"Username:", "black", "white", "white", "auto")
        textBox(0.25 * screenWidth + 9 * 11.5,0.25 * screenHeight + 2 * 17,500,500,objects[indexOfText("Username", objects)].text,"black","white","white","auto", {name: "Username", text: objects[indexOfText("Username", objects)].text})
        button(0.25 * screenWidth, 0.25 * screenHeight + 3 * 17, 500,500,"Password:", "black", "white", "white", "auto")
        textBox(0.25 * screenWidth + 9 * 11.5,0.25 * screenHeight + 3 * 17,500,500,objects[indexOfText("Password", objects)].text,"black","white","white","auto", {name: "Password", text: objects[indexOfText("Password", objects)].text})
      }
      else if (textBoxGroup === "logIn"){
        container(screenWidth * 0.25, screenHeight * 0.25, screenWidth * 0.50, screenHeight * 0.50, "white", "black");
        button(0.25 * screenWidth, 0.25 * screenHeight, 500,500,"Username:", "black", "white", "white", "auto")
        textBox(0.25 * screenWidth + 9 * 11.5,0.25 * screenHeight,500,500,objects[indexOfText("logIn-Username", objects)].text,"black","white","white","auto", {name: "logIn-Username", text: objects[indexOfText("logIn-Username", objects)].text})
        button(0.25 * screenWidth, 0.25 * screenHeight + 17, 500,500,"Password:", "black", "white", "white", "auto")
        textBox(0.25 * screenWidth + 9 * 11.5,0.25 * screenHeight + 17,500,500,objects[indexOfText("logIn-Password", objects)].text,"black","white","white","auto", {name: "logIn-Password", text: objects[indexOfText("logIn-Password", objects)].text})
      }
    }
   }
});
}
function signIn(){
  textBoxGroup = "signIn"
  container(screenWidth * 0.25, screenHeight * 0.25, screenWidth * 0.50, screenHeight * 0.50, "white", "black");
  button(0.25 * screenWidth, 0.25 * screenHeight, 500,500,"Real Name:", "black", "white", "white", "auto")
  textBox(0.25 * screenWidth + 10 * 11.5,0.25 * screenHeight,500,500,objects[indexOfText("Real Name", objects)].text,"black","white","white","auto", {name: "Real Name", text: objects[indexOfText("Real Name", objects)].text})
  button(0.25 * screenWidth, 0.25 * screenHeight + 17, 500,500,"Age:", "black", "white", "white", "auto")
  textBox(0.25 * screenWidth + 4 * 11.5,0.25 * screenHeight + 17,500,500,objects[indexOfText("Age", objects)].text,"black","white","white","auto", {name: "Age", text: objects[indexOfText("Age", objects)].text})
  button(0.25 * screenWidth, 0.25 * screenHeight + 2 * 17, 500,500,"Username:", "black", "white", "white", "auto")
  textBox(0.25 * screenWidth + 9 * 11.5,0.25 * screenHeight + 2 * 17,500,500,objects[indexOfText("Username", objects)].text,"black","white","white","auto", {name: "Username", text: objects[indexOfText("Username", objects)].text})
  button(0.25 * screenWidth, 0.25 * screenHeight + 3 * 17, 500,500,"Password:", "black", "white", "white", "auto")
  textBox(0.25 * screenWidth + 9 * 11.5,0.25 * screenHeight + 3 * 17,500,500,objects[indexOfText("Password", objects)].text,"black","white","white","auto", {name: "Password", text: objects[indexOfText("Password", objects)].text})
}
function logIn(){
  textBoxGroup = "logIn"
  container(screenWidth * 0.25, screenHeight * 0.25, screenWidth * 0.50, screenHeight * 0.50, "white", "black");
  button(0.25 * screenWidth, 0.25 * screenHeight, 500,500,"Username:", "black", "white", "white", "auto")
  textBox(0.25 * screenWidth + 9 * 11.5,0.25 * screenHeight,500,500,objects[indexOfText("logIn-Username", objects)].text,"black","white","white","auto", {name: "logIn-Username", text: objects[indexOfText("logIn-Username", objects)].text})
  button(0.25 * screenWidth, 0.25 * screenHeight + 17, 500,500,"Password:", "black", "white", "white", "auto")
  textBox(0.25 * screenWidth + 9 * 11.5,0.25 * screenHeight + 17,500,500,objects[indexOfText("logIn-Password", objects)].text,"black","white","white","auto", {name: "logIn-Password", text: objects[indexOfText("logIn-Password", objects)].text})
}
setInterval(drawFrame,1000/10000);
function drawFrame(){if (screenId === 0){
  restore(0);
  for (var i = 1; i <= 4; i++){
    var thing = document.getElementById(i);
    thing.style.display = "none";
  }
}
if (screenId === 1){
  restore(1);
  for (var i = 1; i <= 4; i++){
    var thing = document.getElementById(i);
    thing.style.display = "none";
  }
}
if (screenId === 2){
  restore(2);
  for (var i = 1; i <= 4; i++){
    var thing = document.getElementById(i);
    thing.style.display = "block";
  }
}
if (screenId === 3){
  restore(3);
  for (var i = 1; i <= 4; i++){
    var thing = document.getElementById(i);
    thing.style.display = "none";
  }
}
}