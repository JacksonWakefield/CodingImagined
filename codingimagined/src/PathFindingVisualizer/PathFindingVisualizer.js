import React, { Component} from "react";
import Node from "./Node";
import update from 'immutability-helper';
import "./PathFindingVisualizer.css";
import { findAllByTestId } from "@testing-library/react";
import Dijkstra from './Algorithms/Dijkstra.js';
import AStar from './Algorithms/AStar';

export default class PathFindingVisualizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      grid: null,
      mouseDown: false,
      currentSelection: "1"
    };
  }

  createGrid() {
    let width = 15;
    let height = 40;
    var grid = [];
    var id = 0;

    let startNode = {col: 7, row: 5};
    let endNode = {col: 7, row: 30};

    for (let i = 0; i < width; i++) {
      const currentRow = [];
      for (let j = 0; j < height; j++) {
        let nodeState = "none"
        if(i === startNode.col && j === startNode.row) {
          nodeState = "start";
        } else if (i === endNode.col && j === endNode.row) {
          nodeState = "end";
        } 
        currentRow.push({
          col: i,
          row: j,
          id: id,
          state: nodeState, 
          weightvalue: 0
        });
        id++;
      }
      grid.push(currentRow);
    }
    return (grid);
  }

  componentDidMount() {
    this.resetGrid()
  }

  addNode(row, col) {
    if(this.state.mouseDown) {
      if(this.state.grid[col][row].state === "expand" || this.state.grid[col][row].state === "weight") {
        this.setState({grid: update(this.state.grid, {[col]: {[row]: {state: {$set: "none"}}}})}); 
      } else if(this.state.grid[col][row].state === "end") {

      } else if(this.state.grid[col][row].state === "start") {

      } else {
        if(this.state.currentSelection === "1") {
          this.setState({grid: update(this.state.grid, {[col]: {[row]: {state: {$set: "expand"}}}})}); 
        } else if(this.state.currentSelection === "2") {
          this.setState({grid: update(this.state.grid, {[col]: {[row]: {state: {$set: "wall"}}}})}); 
        }
      }
    }
  }

  handleMouseDown(row, col) {
    if(this.state.grid[col][row].state === "expand" || this.state.grid[col][row].state === "weight") {
      this.setState({grid: update(this.state.grid, {[col]: {[row]: {state: {$set: "none"}}}})}); 
    } else if(this.state.grid[col][row].state === "end") {

    } else if(this.state.grid[col][row].state === "start") {

    } else {
      if(this.state.currentSelection === "1") {
        this.setState({grid: update(this.state.grid, {[col]: {[row]: {state: {$set: "expand"}}}})}); 
      } else if (this.state.currentSelection === "2") {
        this.setState({grid: update(this.state.grid, {[col]: {[row]: {state: {$set: "wall"}}}})}); 
      }
    }
    this.setState({mouseDown: true});
  }

  handleMouseUp() {
    this.setState({mouseDown: false});
  }

  resetGrid() {
    this.setState({
      grid: this.createGrid(),
      isLoading: false
    });
  }
  


  render() {
    if (this.state.isLoading) {
      return <div></div>;
    } else {
      if(this.state.grid != null){
        //const dij = new Dijkstra(this.state.grid);
        const aStar = new AStar(
          this.state.grid, 
          this.state.grid[0][0], 
          this.state.grid[this.state.grid.length - 1][this.state.grid[0].length - 1]
        );
        let next = true;
        while(next != false){
        next = aStar.next();
        console.log(next);
        }
      }
      
      let grid = this.state.grid;
      return (
        <div className="center">
          <button onClick={() => this.resetGrid()}> Reset Grid </button>
          <label htmlFor="Weight">Toggle Weights </label>
          <select id = "Weight" onChange={(option)=>this.setState({currentSelection: option.target.value})}>
               <option value = "1">Wall</option>
               <option value = "2">Weights</option>
          </select>
          <label id="Algo"> Select Algorithm </label>
          <select id="Algo">
            <option value = "1"> Dijkstra's </option>
            <option value = "2"> Some other one </option>
          </select>
          <div>
          {grid.map(row => {
            return (
              <div key={row[0].col} className="row">
                {row.map(node => {
                  return <Node
                    col={node.col} 
                    row={node.row} 
                    key={node.id}
                    addNode={(row, col) => this.addNode(node.row, node.col)}
                    handleMouseDown={(row, col) => this.handleMouseDown(node.row, node.col)}
                    handleMouseUp={() => this.handleMouseUp()}
                    state={node.state}  
                    ></Node>;
                })}
              </div>
            );
          })}
          </div>
        </div>
      );
      
    }
  }
}
