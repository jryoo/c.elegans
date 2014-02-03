$(document).ready(function(){
    //Canvas stuff
    var canvas = $("#canvas")[0];
    var context = canvas.getContext("2d");
    var w = $("#canvas").width();
    var h = $("#canvas").height();

    canvas.addEventListener('click', handleClick);
    
    //Lets save the cell width in a variable for easy control
    var cellWidth = 5;
    var direction; // direction
    var move; // whether or not the worm is moving
    var food = {x: 10, y:10}; // location of food
    var max_scentDistance = (w/cellWidth)/4;
    
    //Lets create the snake now
    var snake_array; //an array of cells to make up the snake
    var scent_array; //a 2x2 array of cells with smell signal strength

    var brain = (function () {
        var my = {},
            signalStrength = 0;

        function privateMethod() {
            // ...
        }

        my.moduleProperty = 1;
        my.moduleMethod = function () {
            // ...
        };

        return my;
    }());
    
    function init()
    {
        //direction = "up"; //default direction
        
        create_worm();
        //create_food(); //Now we can see the food particle
        
        //Lets move the snake now using a timer which will trigger the paint function
        //every 60ms
        //if(typeof game_loop != "undefined") clearInterval(game_loop);
        //game_loop = setInterval(paint, 60);
        scent_array = [];
        for(var i = 0; i < (w/cellWidth); i++) {
            scent_array[i] = [];
            for(var j = 0; j < (h/cellWidth); j++) {
                scent_array[i][j] = 0;
            }
        }
        paint();
    }
    init();
    
    function create_worm()
    {
        var length = 5; //Length of the snake
        snake_array = []; //Empty array to start with
        for(var i = length-1; i>=0; i--)
        {
            //This will create a horizontal snake starting from the top left
            snake_array.push({x: ((w/cellWidth)/2) - 1 , y: (w/cellWidth) - i });
        }
    }
    
    //Lets paint the snake now
    function paint()
    {
        console.log('paint');
        //To avoid the snake trail we need to paint the BG on every frame
        //Refresh the canvas
        paint_refresh("white");
        
        //The movement code for the snake to come here.
        //The logic is simple
        //Pop out the tail cell and place it infront of the head cell
        var next_x = snake_array[0].x;
        var next_y = snake_array[0].y;
        //These were the position of the head cell.
        //We will increment it to get the new head position
        //Lets add proper direction based movement now
        if(direction == "right") next_x++;
        else if(direction == "left") next_x--;
        else if(direction == "up") next_y--;
        else if(direction == "down") next_y++;
        
        paint_grid("#FFFFFF", "#E8E8E8");

        paint_cell(food.x, food.y, "black");
        //paint_scent(food.x, food.y);
    }

    // Refresh Canvas
    function paint_refresh(color) {
        context.fillStyle = color;
        context.fillRect(0, 0, w, h);
        context.strokeStyle = color;
        context.strokeRect(0, 0, w, h);
    }

    function paint_scent(x, y, color) {
        color = "rgb(0, 0, 0)";
        paint_cell(x,y, color);
        for(var i = 0; i < (w/cellWidth); i++) {
            for(var j = 0; j < (h/cellWidth); j++) {
                var strength = scent_array[i][j];
                var color_val = (255-Math.round((strength * 255))).toString();
                color = "rgb(" + color_val + ", " + color_val + ", " + color_val + ")";
                paint_cell(i, j, color, color);
            }
        }
    }

    function distance(x1, y1, x2, y2) { 
        return Math.sqrt(Math.pow((x2-x1),2)+ Math.pow((y2-y1),2));
    }

    // Paint the grid
    function paint_grid(innerColor, outerColor) {
        for(var i = 0; i < (w/cellWidth); i++) {
            for(var j = 0; j < (h/cellWidth); j++) {
                paint_cell(i, j, innerColor, outerColor);
            }
        }
    }
    
    //Lets first create a generic function to paint cells
    function paint_cell(x, y, innerColor, outerColor)
    {
        if (outerColor === undefined) {
            outerColor = innerColor;
        }
        context.fillStyle = innerColor;
        context.fillRect(x*cellWidth, y*cellWidth, cellWidth, cellWidth);

        context.strokeStyle = outerColor;
        context.strokeRect(x*cellWidth, y*cellWidth, cellWidth, cellWidth);
    }

    function changeFoodLocation(x, y) {
        paint_cell(x, y, "black");
        food.x = x;
        food.y = y;
        set_scent_strength(x,y);
    }

    function set_scent_strength(x,y) {
        for(var i = 0; i < (w/cellWidth); i++) {
            for(var j = 0; j < (h/cellWidth); j++) {
                var dist = distance(x,y,i,j);
                if (dist >= max_scentDistance) {
                     scent_array[i][j] = 0;
                } else {
                    scent_array[i][j] = (max_scentDistance-dist) / max_scentDistance;
                }
            }
        }
    }
    
    function handleClick(e) {
        clicked_x = Math.floor(e.offsetX/cellWidth);
        clicked_y = Math.floor(e.offsetY/cellWidth);
        changeFoodLocation(clicked_x, clicked_y);

        paint();
    }
    
});