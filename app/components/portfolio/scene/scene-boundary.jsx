'use client';
import { Component } from 'react';
export default class SceneBoundary extends Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onUnavailable();}
 render(){return this.state.failed?null:this.props.children;}
}
