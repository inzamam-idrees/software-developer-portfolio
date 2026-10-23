"use client";
import { Component } from "react";

// Catches a scene chunk that fails to load or a renderer that cannot start,
// so the server-rendered page stays and the stage drops to the no-3D tier.
export default class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onUnavailable();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
