import React, { Component } from 'react';

class ErrorBoundary extends Component {
    state = {
        error: false
    };

    static getDerivedStateFromError(error) {
        return { error: true };
    }

      componentDidCatch(error, errorInfo) {
        this.props.onFail(error, errorInfo);
    }


    render() {
        if (this.state.error) {
            return null;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;