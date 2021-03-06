import React, { Component } from "react";
import Node from "./Node";
import update from 'immutability-helper';
import "../../css/PathFindingVisualizer.css";
import AStar from "./Algorithms/AStar"
import Dijkstra from "./Algorithms/Dijkstra"
import BreadthFirst from "./Algorithms/BreadthFirst"
import { scryRenderedDOMComponentsWithTag } from "react-dom/test-utils";
import { any } from "prop-types";
import GenerateRandomMaze from "./GenerateRandomMaze";

export default class PathFindingVisualizer extends Component {
    /**
     * 
     * @param {*} props
     * @param {Object} this.state 
     * @param {Boolean} this.state.isLoading represents whether the grid is loading or not (only triggers at start of rendering)
     * @param {Object[][]} this.state.grid 2d grid of objects representing each node
     * @param {boolean} this.state.mouseDown whether the mouse is currently pressed
     * @param {String} currentSelection current selection of node to be placed
     * @param {boolean} stopAnimation
     * @param {boolean} isRunningAnimation whether an animation is running currently
     * @param {String} algoSelection current selecction of which algo is selected currently
     * @param {Object} startNode coordinates of the default start node
     * @param {Object} endNode coordinates of the default end node
     * @param {Object} mouseOVerNode current node being hovered over
     * @param {Number} brushSize size of the current brush
     * @param {Number} stop
     * @param {boolean} weight 
     */
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            grid: null,
            mouseDown: false,
            currentSelection: "1",
            stopAnimation: false,
            isRunningAnimation: false,
            algoSelection: "1",
            startNode: { col: 7, row: 5 },
            endNode: { col: 7, row: 30 },
            mouseOverNode: null,
            preHoverState: "",
            brushSize: 1,
            stop: 0,
            weight: false
        };
    }

    /**
     * Creates the default starting grid with dimmensions based on intial seettings of width and height
     * @returns {Object[][]} returns a grid of nodes 
     */
    createGrid() {
        let width = 15;
        let height = 40;
        var grid = [];
        var id = 0;
    
        for (let i = 0; i < width; i++) {
            const currentRow = [];
            for (let j = 0; j < height; j++) {
                let nodeState = "none"
        
                if (i === this.state.startNode.col && j === this.state.startNode.row) {
                    nodeState = "start";
                } else if (i === this.state.endNode.col && j === this.state.endNode.row) {
                    nodeState = "end";
                }
                let renderTime = j + i;
                currentRow.push({
                    col: i,
                    row: j,
                    state: nodeState,
                    id: id,
                    isRendered: false,
                    renderTime: renderTime,
                    weight: 1,
                    opacity: 0
                });
                id++;
            }
            grid.push(currentRow);
        }
        return (grid);
    }

    componentDidMount() {
        this.resetGrid();
    }


   /**
    * Changes the state of the node based on the value of this.state.currentSelection.  
    * @param {Number} row x cordinates of the node 
    * @param {Number} col y coordiinates of the node
    */
    addNode(row, col) {
        if (!this.state.mouseDown) {
            this.setState({ preHoverState: this.state.grid[col][row].state });
            this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "nodeHover" } } } }) });
        }

        if (this.state.currentSelection === "1") {
            if (this.state.grid[col][row].state == "wall") {
                this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "none" } } } }) });
            } else if (this.state.grid[col][row].state != "start" && this.state.grid[col][row].state != "end") {
                this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "wall" } } } }) });
            }
        }
        else if (this.state.currentSelection === "2") { // add weight
            this.state.grid[col][row].weight += 1;
            this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "weighted" + String(Math.min(this.state.grid[col][row].weight, 5)) } } } }) });
        }
        else if (this.state.currentSelection === "3") {
            this.state.grid[this.state.startNode.col][this.state.startNode.row].state = "none";
            this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "start" } } } }) });
            this.state.startNode = { col: col, row: row };
        } else if (this.state.currentSelection === "4") {
            this.state.grid[this.state.endNode.col][this.state.endNode.row].state = "end";
            this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "end" } } } }) });
            this.state.endNode = { col: col, row: row };
        }

    }

    //pretty much the same thing as the addNode method
    handleMouseDown(row, col) {
        if (this.state.mouseDown == false) {
            this.setState({ preHoverState: this.state.grid[col][row].state });
            this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "nodeHover" } } } }) });
            return;
        }

        if (this.state.currentSelection === "1") {
            if (this.state.grid[col][row].state == "wall") {
                this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "none" } } } }) });
            } else if (this.state.grid[col][row].state != "start" && this.state.grid[col][row].state != "end") {
                this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "wall" } } } }) });
            }
        }
        else if (this.state.currentSelection === "2") { // add weight
            this.state.grid[col][row].weight += 1;
            this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "weighted" + String(Math.min(this.state.grid[col][row].weight, 5)) } } } }) });
        }
        else if (this.state.currentSelection === "3") {
            this.state.grid[this.state.startNode.col][this.state.startNode.row].state = "none";
            this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "start" } } } }) });
            this.state.startNode = { col: col, row: row };
        } else if (this.state.currentSelection === "4") {
            this.state.grid[this.state.endNode.col][this.state.endNode.row].state = "none";
            this.setState({ grid: update(this.state.grid, { [col]: { [row]: { state: { $set: "end" } } } }) });
            this.state.endNode = { col: col, row: row };
        }


    }

    //de-hover tiles not hovered over
    dehover(row, col) {
        if (!this.state.mouseDown) {
            if (this.state.preHoverState != "nodeHover") {
                this.state.grid[col][row].state = this.state.preHoverState;
            }
            else {
                //idk
            }

        }
    }

    handleMouseUp() {
        //this.setState({ mouseDown: false });
    }

    getBrushNodesByCenter(row, col, size) {
        let nodes = [];
        nodes.push(this.state.grid[col][row]);
        for (let i = 0; i < size - 1; i++) {
            nodes.forEach(element => {
                let adj = this.getAdjacent(element.row, element.col);
                adj.forEach(newElement => {
                    if (!nodes.includes(newElement)) {
                        nodes.push(newElement);
                    }
                });

            });
        }

        return nodes;
    }
    
    //resets the grid to the starting values
    resetGrid() {
        clearInterval(this.state.stop);
        this.state.stopAnimation = true;
        this.setState({
            isLoading: false,
            grid: this.createGrid()
        });
    }

    generateWeightedRandomGrid() {
        this.resetGrid();
        let width = 15;
        let height = 40;
        var grid = [];
        var id = 0;

        let randomMaze = new GenerateRandomMaze();
        var randomGrid = randomMaze.generateWeightedMaze(width, height);

        for (let i = 0; i < width; i++) {
            const currentRow = [];
            for (let j = 0; j < height; j++) {
                let renderTime = j + i;
                let nodeState = "none";
                let weight = 0;
                if (randomGrid[i][j].type == "wall") {
                    nodeState = "wall";
                } else if (randomGrid[i][j].type == "start") {
                    nodeState = "start";
                    this.state.startNode.col = i;
                    this.state.startNode.row = j;
                } else if (randomGrid[i][j].type == "end") {
                    nodeState = "end";
                    this.state.endNode.col = i;
                    this.state.endNode.row = j;
                } else if (randomGrid[i][j].type.substring(0,6) == "weight") {
                    nodeState = randomGrid[i][j].type;
                    weight = parseInt(randomGrid[i][j].type.substring(8));
                }
                currentRow.push({
                    col: i,
                    row: j,
                    state: nodeState,
                    id: id,
                    isRendered: false,
                    renderTime: renderTime,
                    weight: weight,
                    opacity: 0
                });
                id++;
            }
            grid.push(currentRow);
        }
        this.setState({
            isLoading: false,
            grid: grid
        });
    }

    generateRandomGrid() {
        this.resetGrid();
        let width = 15;
        let height = 40;
        var grid = [];
        var id = 0;

        let randomMaze = new GenerateRandomMaze();
        var randomGrid = randomMaze.maze(width, height);

        for (let i = 0; i < width; i++) {
            const currentRow = [];
            for (let j = 0; j < height; j++) {
                let renderTime = j + i;
                let nodeState = "none";
                let weight = 0;
                if (randomGrid[i][j].type == "wall") {
                    nodeState = "wall";
                } else if (randomGrid[i][j].type == "start") {
                    nodeState = "start";
                    this.state.startNode.col = i;
                    this.state.startNode.row = j;
                } else if (randomGrid[i][j].type == "end") {
                    nodeState = "end";
                    this.state.endNode.col = i;
                    this.state.endNode.row = j;
                } 
                currentRow.push({
                    col: i,
                    row: j,
                    state: nodeState,
                    id: id,
                    isRendered: false,
                    renderTime: renderTime,
                    weight: 1,
                    opacity: 0
                });
                id++;
            }
            grid.push(currentRow);
        }
        this.setState({
            isLoading: false,
            grid: grid
        });
    }

    //toggles the weight numbers in each div
    toggleWeightNumber() {
      this.setState({weight: !this.state.weight});
      console.log(this.state.weight)
    }

    //finds the path between the start and end node
    findPath() {
        if (this.state.grid != null && !this.state.isRunningAnimation) {
            let algo = null;
            let timeInterval = 0;
            //time interval represents the amount of time it takes between each animation
            if (this.state.algoSelection === "1") {
                algo = new AStar(this.state.grid, this.state.grid[this.state.startNode.col][this.state.startNode.row], this.state.grid[this.state.endNode.col][this.state.endNode.row]);
                timeInterval = 200;
            } else if (this.state.algoSelection === "2") {
                algo = new Dijkstra(this.state.grid, this.state.grid[this.state.startNode.col][this.state.startNode.row], this.state.grid[this.state.endNode.col][this.state.endNode.row]);
                timeInterval = 50;
            } else if (this.state.algoSelection === "3") {
                algo = new BreadthFirst(this.state.grid, this.state.grid[this.state.startNode.col][this.state.startNode.row], this.state.grid[this.state.endNode.col][this.state.endNode.row]);
            }
            //redundant get rid of this if you dont need it ethan
            if (this.state.isRunningAnimation) {
                this.state.isRunningAnimation = false;
            }

            let output = algo.order;
            let finalPath = algo.pathOrder;
            let finalPathCount = algo.pathOrder.length - 1;

            let count = 0;
            let secondCount = 0;
            this.state.stop = setInterval(
                function (y) {
                    y = count;
                    if (y >= output.length) {
                        if (finalPathCount >= 0) {
                            this.setState({ grid: update(this.state.grid, { [finalPath[finalPathCount].col]: { [finalPath[finalPathCount].row]: { state: { $set: "secondaryExpand" } } } }) });
                            finalPathCount--;
                        } else {
                            clearInterval(this.state.stop);
                        }
                    } else {
                        this.setState({ grid: update(this.state.grid, { [output[y].col]: { [output[y].row]: { state: { $set: "expand" } } } }) });
                        count++;
                    }

                }.bind(this),
                count * timeInterval, count
            );
            this.state.isRunningAnimation = false;
        }
    }

    getAdjacent(row, col) {
        let adjConsts = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        let adj = [];


        for (let i = 0; i < 4; i++) {
            try {
                if (this.state.grid[col + adjConsts[i][0]][row + adjConsts[i][1]] != null) {
                    adj.push(this.state.grid[col + adjConsts[i][0]][row + adjConsts[i][1]]);
                }
            } catch (error) { }
        }
        return adj;
    }

    render() {
        this.mouseDown = false;
        if (this.state.isLoading) {
            return <div></div>;
        } else {
            let grid = this.state.grid;
            return (
                <div className="center">
                    <button onClick={() => this.generateWeightedRandomGrid()}> Generate Weighted Maze </button>
                    <button onClick={() => this.generateRandomGrid()}> Generate Maze </button>
                    <button onClick={() => this.resetGrid()}> Reset Grid </button>
                    <button onClick={() => this.findPath()}> Find Path </button>
                    <button onClick={() => this.toggleWeightNumber()}> Toggle Weight Numbers </button>
                    <label htmlFor="Weight">Toggle Placement</label>
                    <select id="Weight" onChange={(option) => this.setState({ currentSelection: option.target.value })}>
                        <option value="1">Wall</option>
                        <option value="2">Weights</option>
                        <option value="3">Start Node</option>
                        <option value="4">End Node</option>
                    </select>
                    <select id="Brush Size" onChange={(option) => this.setState({brushSize: option.target.value})}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                    <label id="Algo"> Select Algorithm </label>
                    <select id="Algo" onChange={(option) => this.setState({ algoSelection: option.target.value })}>
                        <option value="1"> A-Star </option>
                        <option value="2"> Dijkstra's </option>
                        <option value="3"> BreadthFirst </option>
                    </select>
                    <div class="centerGrid" onMouseDown={() => this.state.mouseDown = true} onMouseUp={() => this.state.mouseDown = false}>
                        {grid.map(row => {
                            return (
                                <div key={row[0].col} className="row">
                                    {row.map(node => {
                                        return <Node
                                            col={node.col}
                                            row={node.row}
                                            key={node.id}
                                            renderTime={node.renderTime}
                                            addNode={() => this.addNode(node.row, node.col)}
                                            handleMouseDown={() => this.addNode(node.row, node.col)}
                                            handleMouseOver={() => this.handleMouseDown(node.row, node.col)}
                                            dehover={() => this.dehover(node.row, node.col)}
                                            //handleMouseUp={() => console.log("hihi")}
                                            state={node.state}
                                            isRendered={false}
                                            weight={node.weight}
                                            displayWeight={this.state.weight}
                                        ></Node>;
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div >
            );
        }
    }
}
