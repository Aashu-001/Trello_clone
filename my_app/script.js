let draggedCard =null;
let rightClickedCard =null;

document.addEventListener("DOMContentLoaded",loadTaskFromLocalStorage);
function addTask(columnId){

    const input =document.getElementById(`${columnId}-input`);
    const taskText=input.value.trim();
    

    if(taskText === ""){
        return;
    }
    const taskDate = new Date().toLocaleString();


    const taskElement = createTaskElement(taskText,taskDate);
    document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
    updateTasksCount(columnId);
    // console.log(columnId)
    saveTaskToLocalStorage(columnId,taskText,taskDate);
    input.value = "";

}
function createTaskElement(taskText,taskDate){
    const element=document.createElement("div");
      
    element.innerHTML = `<span>${taskText}</span><br><small class ="time">${taskDate}</small>`;
    element.classList.add("card");
    element.draggable = true;
    element.addEventListener("dragstart",dragStart);
    element.addEventListener("dragend", dragEnd);
    element.addEventListener("contextmenu",function(event) {
        event.preventDefault();
        rightClickedCard = this;
        showContextMenu(event.pageX,event.pageY);
    }); 
    return element;
    
}

function dragStart(){
    this.classList.add("dragging");
    draggedCard = this;
}

function dragEnd(){
    this.classList.remove("dragging");
    draggedCard = null;
    ["todo","doing","done"].forEach((columnId)=>{
        updateTasksCount(columnId);
         updateLocaleStorage(); 
    })
   
};
const columns =document.querySelectorAll(".column .tasks");
columns.forEach((column) =>{
    column.addEventListener("dragover",dragOver);
});


function dragOver(event){
    event.preventDefault();
    const draggedCard = document.querySelector(".dragging");
    // this.appendChild(draggedCard);
    const afterElement = getDragAfterElement(this,event.pageY);

    if(afterElement === null){
        this.appendChild(draggedCard);
    }
    else{
        this.insertBefore(draggedCard,afterElement);
    }

}

function getDragAfterElement(container,y){
    const draggableElements =[
        ...container.querySelectorAll(".card:not(.dragging"),
    ];
   
    const result = draggableElements.reduce(
        (closestElementUnderMouse, currentTask)=>{
            const box = currentTask.getBoundingClientRect();
            const offset = y- box.top - box.height/2;
            if(offset< 0 && offset > closestElementUnderMouse.offset){
                return {offset: offset , element:currentTask};
            }
                else{
                    return closestElementUnderMouse;
                }
            },
            {offset:Number.NEGATIVE_INFINITY}
        
        
    );

    return result.element;
}


const contextmenu = document.querySelector(".context-menu")
function showContextMenu(x,y){
    console.log(x,y)
    contextmenu.style.left =`${x}px`;
    contextmenu.style.top =`${y}px`;
    contextmenu.style.display = "block";
}
document.addEventListener("click",()=>{
    contextmenu.style.display = "none";
});

function editTask(){
    if(rightClickedCard != null){
        const newTaskText =prompt("EDIT TASK ---", rightClickedCard.textContent);
        if(newTaskText!=null){
            rightClickedCard.textContent = newTaskText;
            updateLocaleStorage();
        }
    }
}
function deleteTask(){
    if(rightClickedCard!=null){
        const columnId = rightClickedCard.parentElement.id.replace("-tasks", "");
    rightClickedCard.remove();
   
    updateLocaleStorage();
    updateTasksCount(columnId);
    }
    
}

 function updateTasksCount(columnId){
    const count = document.querySelectorAll(`#${columnId}-tasks .card`).length;
    document.getElementById(`${columnId}-count`).textContent = count;

 }

  

  //SETUP THE LOCAL STORAGE:
function saveTaskToLocalStorage(columnId,taskText,taskDate){
    const tasks = JSON.parse(localStorage.getItem(columnId))||[];
    
    tasks.push({text:taskText,date:taskDate});
    localStorage.setItem(columnId,JSON.stringify(tasks));
}


function loadTaskFromLocalStorage(){
 ["todo","doing","done"].forEach((columnId)=>{
    const tasks = JSON.parse(localStorage.getItem(columnId))||[];
    tasks.forEach(({text,date})=>{
        const taskElement = createTaskElement(text, date);
        document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
    }) ;
    updateTasksCount(columnId);
 })
}

function updateLocaleStorage(){
    ["todo","doing","done"].forEach((columnId)=>{
        const tasks = [];
        console.log("run");
        document.querySelectorAll(`#${columnId}-tasks .card`).forEach((card)=>{
            const taskText = card.querySelector("span").textContent;
            const taskDate = card.querySelector("small").textContent;
            tasks.push({text:taskText , date:taskDate} );
        });
        localStorage.setItem(columnId,JSON.stringify(tasks));
    });
}