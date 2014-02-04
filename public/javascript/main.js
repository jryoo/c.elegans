$(document).ready(function(){
    //Canvas stuff
    var canvas = $("#canvas")[0];
    var context = canvas.getContext("2d");
    var w = Math.floor($("#canvas").width());
    var h = Math.floor($("#canvas").height());

    canvas.addEventListener('click', handleClick);
    
    //Lets save the cell width in a variable for easy control
    var cellWidth = 5;
    //var direction; // direction
    //var move; // whether or not the worm is moving
    var food = {x: 10, y:10}; // location of food
    var max_scentDistance = (w/cellWidth)/4;
    var direction = "up";

    var config = {
        show_grid: true,
        show_scent: true,
        grid_color: "#E8E8E8",
        food_color: "#737374",
        worm_color: "#737374",
        strongScent_color: "#B3C5F7",
        weakScent_color: "#FFFFFF"
    };
    
    //Lets create the worm now
    var worm_array; //an array of cells to make up the worm
    var scent_array; //a 2x2 array of cells with smell signal strength

    var brain = (function () {
        var my = {},
            signalStrength = 0;

        function privateMethod() {
            // ...
        }

        my.moduleProperty = 1;
        my.getInstructions = function (data) {
            // forward
            // turn-left
            // turn-right
            // reverse
            return "forward";
        };

        return my;
    }());

    function check_collision(x, y, array) {
        //This function will check if the provided x/y coordinates exist
        //in an array of cells or not
        for(var i = 0; i < array.length; i++)
        {
            if(array[i].x == x && array[i].y == y)
             return true;
        }
        return false;
    }
    
    function init()
    {
        //direction = "up"; //default direction
        
        create_worm();
        //create_food(); //Now we can see the food particle
        
        //Lets move the worm now using a timer which will trigger the paint function
        //every 60ms
        if(typeof game_loop != "undefined") clearInterval(game_loop);
        game_loop = setInterval(iterate, 1000);

        // initialize the scent_array
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
        var length = 5; //Length of the worm
        worm_array = []; //Empty array to start with
        for(var i = length; i>=0; i--) {
            //This will create a horizontal worm starting from the top left
            worm_array.push({x: ((w/cellWidth)/2) - 1 , y: (w/cellWidth) - i });
        }
    }

    function iterate() {
        //The movement code for the worm to come here.
        //The logic is simple
        //Pop out the tail cell and place it infront of the head cell
        var next_x = worm_array[0].x;
        var next_y = worm_array[0].y;
        //These were the position of the head cell.
        //We will increment it to get the new head position
        //Lets add proper direction based movement now
        instruction = brain.getInstructions();
        direction = "up";
        if(direction == "right") next_x++;
        else if(direction == "left") next_x--;
        else if(direction == "up") next_y--;
        else if(direction == "down") next_y++;
        var tail = worm_array.pop(); //pops out the last cell
        tail.x = next_x; tail.y = next_y;
        worm_array.unshift(tail);
        paint();
    }
    //Lets paint the worm now
    function paint()
    {
        console.log('paint');
        //To avoid the worm trail we need to paint the BG on every frame
        //Refresh the canvas
        paint_refresh("white");

        // Paint the grid
        if (config.show_grid) {
            paint_grid("#FFFFFF", config.grid_color);
        }
        if (config.show_scent) {
            paint_scent(food.x, food.y);
        }
        paint_cell(food.x, food.y, "black");
        paint_worm();
    }


    // Refresh Canvas
    function paint_refresh(color) {
        context.fillStyle = color;
        context.fillRect(0, 0, w, h);
        context.strokeStyle = color;
        context.strokeRect(0, 0, w, h);
    }

    function paint_scent(x, y) {
        //TODO: allow different colors
        for(var i = 0; i < (w/cellWidth); i++) {
            for(var j = 0; j < (h/cellWidth); j++) {
                var strength = scent_array[i][j];
                if (strength > 0) {
                    //var color_val = (255-Math.round((strength * 255))).toString();
                    //color = "rgb(" + color_val + ", " + color_val + ", " + color_val + ")";
                    color = getColorRange(config.weakScent_color, config.strongScent_color, Math.round((strength * 100)));
                    paint_cell(i, j, color, (config.show_grid ? config.grid_color : color));
                }
            }
        }
    }

    function getColorRange(lowColor, highColor, num) {
        var rainbow = new Rainbow(); 
        rainbow.setSpectrum(lowColor, highColor);
        /*var s = [];
        for (var i = 1; i <= numberOfItems; i++) {
            var hexColour = rainbow.colourAt(i);
            s[i] += '#' + hexColour + ', ';
        }
*/      return '#' + rainbow.colourAt(num);
    }

    function paint_worm() {
        for(var i = 0; i < worm_array.length; i++)
        {
            var c = worm_array[i];
            paint_cell(c.x, c.y, config.worm_color);
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
    function paint_cell(x, y, innerColor, outerColor) {
        if (outerColor === undefined) {
            outerColor = innerColor;
        }
        // Fill in the rectangle with innerColor
        context.fillStyle = innerColor;
        context.fillRect(x*cellWidth, y*cellWidth, cellWidth, cellWidth);

        // Fill in the border with outerColor
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
        max_x = (w/cellWidth)-1;
        min_x = 0;
        max_y = (h/cellWidth)-1;
        min_y = 0;
        if (clicked_x > max_x) {
            clicked_x = max_x;
        } else if (clicked_x < min_x) {
            clicked_x = min_x;
        }
        if (clicked_y > max_y) {
            clicked_y = max_y;
        } else if (clicked_y < min_y) { 
            clicked_y = min_y;
        }
        changeFoodLocation(clicked_x, clicked_y);
        console.log(clicked_x);
        console.log(clicked_y);
        paint();
    }
    
});