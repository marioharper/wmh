import React from 'react';
import { Animated, Dimensions, View, ART } from 'react-native';
import PropTypes from 'prop-types';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const { Surface, Shape } = ART;

const AnimatedShape = Animated.createAnimatedComponent(Shape);

const HEART_SVG =
  'M130.4-0.8c25.4 0 46 20.6 46 46.1 0 13.1-5.5 24.9-14.2 33.3L88 153.6 12.5 77.3c-7.9-8.3-12.8-19.6-12.8-31.9 0-25.5 20.6-46.1 46-46.2 19.1 0 35.5 11.7 42.4 28.4C94.9 11 111.3-0.8 130.4-0.8';
const HEART_COLOR = 'rgb(226,38,77,1)';

class HeartLogo extends React.Component {
  static defaultProps = {
    beatSpeed: 200,
    isSearching: false,
  };

  static propTypes = {
    beatSpeed: PropTypes.number,
    isSearching: PropTypes.bool,
  };

  state = {
    frames: new Animated.Value(0),
  };

  componentDidMount() {
    this.appear();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSearching !== this.props.isSearching) {
      if (nextProps.isSearching) {
        this.startHeartBeat();
      } else {
        this.stopHeartBeat();
      }
    }
  }

  appear = () => {
    Animated.timing(this.state.frames, {
      duration: 1000,
      toValue: 30,
    }).start();
  };

  startHeartBeat = () => {
    this.animationLoop = Animated.loop(
      Animated.timing(this.state.frames, {
        duration: 1000,
        toValue: 30,
      }),
    );

    this.animationLoop.start();
  };

  stopHeartBeat = () => {
    this.animationLoop.stop();
    this.state.frames.setValue(30);
  };

  getHeart = () => {
    let heartScale;

    if (this.props.isSearching) {
      heartScale = this.state.frames.interpolate({
        inputRange: [0, 6, 10, 12, 18],
        outputRange: [0.5, 0.6, 0.5, 0.6, 0.5],
        extrapolate: 'clamp',
      });
    } else {
      heartScale = this.state.frames.interpolate({
        inputRange: [0, 6, 10, 12, 18],
        outputRange: [0, 0.1, 0.5, 0.6, 0.5],
        extrapolate: 'clamp',
      });
    }

    const heartX = heartScale.interpolate({
      inputRange: [0, 1],
      outputRange: [125, 35],
    });

    const heartY = heartScale.interpolate({
      inputRange: [0, 1],
      outputRange: [125, 45],
    });

    return (
      <AnimatedShape d={HEART_SVG} x={heartX} y={heartY} scale={heartScale} fill={HEART_COLOR} />
    );
  };

  render() {
    return (
      <Surface width={250} height={250} style={{ backgroundColor: 'transparent' }}>
        {this.getHeart()}
      </Surface>
    );
  }
}

export default HeartLogo;
