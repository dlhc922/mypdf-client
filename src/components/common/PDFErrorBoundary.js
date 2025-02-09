import React from 'react';

class PDFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PDF Error:', {
      error: error.message,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h3>PDF 加载失败</h3>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// 在 PDFPreviewCard 中使用
function PDFPreviewCard({ file, index, onRemove }) {
  return (
    <PDFErrorBoundary>
      {/* 原有内容 */}
    </PDFErrorBoundary>
  );
} 