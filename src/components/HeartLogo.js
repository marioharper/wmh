import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const size = 15;

const styles = StyleSheet.create({
  block: {
    width: size,
    height: size,
    backgroundColor: '#DA353F',
  },
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: size,
    borderTopWidth: size,
    borderRightColor: 'transparent',
    borderTopColor: '#DA353F',
  },
  triangleCornerBottomRight: {
    transform: [{ rotate: '180deg' }],
  },
  triangleCornerBottomLeft: {
    transform: [{ rotate: '270deg' }],
  },
  triangleCornerTopRight: {
    transform: [{ rotate: '90deg' }],
  },
});

const Block = ({ style }) => <Animated.View style={[styles.block, style]} />;

const TriangleCorner = ({ style }) => <Animated.View style={[styles.triangleCorner, style]} />;

const TriangleCornerBottomRight = () => <TriangleCorner style={styles.triangleCornerBottomRight} />;

const TriangleCornerBottomLeft = () => <TriangleCorner style={styles.triangleCornerBottomLeft} />;

const TriangleCornerTopRight = () => <TriangleCorner style={styles.triangleCornerTopRight} />;

const TriangleCornerTopLeft = TriangleCorner;

class HeartLogo extends React.Component {
  constructor() {
    super();

    this.shown = new Animated.Value(0);
  }

  componentDidMount() {
    Animated.timing(this.shown, {
      toValue: 1,
      duration: 2000,
    }).start(this.props.after);
  }

  render() {
    const opacity = this.shown;

    return (
      <Animated.View style={{ opacity }}>
        <View style={{ flexDirection: 'row' }}>
          <TriangleCornerBottomRight />
          <TriangleCornerBottomLeft />
          <TriangleCornerBottomRight />
          <TriangleCornerBottomLeft />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Block />
          <Block />
          <Block />
          <Block />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TriangleCornerTopRight />
          <Block />
          <Block />
          <TriangleCornerTopLeft />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Block style={{ backgroundColor: 'transparent' }} />
          <TriangleCornerTopRight />
          <TriangleCornerTopLeft />
          <Block style={{ backgroundColor: 'transparent' }} />
        </View>
      </Animated.View>
    );
  }
}

export default HeartLogo;
