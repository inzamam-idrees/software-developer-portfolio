"use client";
import { Component } from "react";

export default class StationBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    this.props.onError?.(this.props.name, error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
