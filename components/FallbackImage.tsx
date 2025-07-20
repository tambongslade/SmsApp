import React, { useState } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

interface FallbackImageProps extends ImageProps {
  source: ImageSourcePropType;
  fallbackSource: ImageSourcePropType;
}

const FallbackImage: React.FC<FallbackImageProps> = ({ source, fallbackSource, ...props }) => {
  const [hasError, setHasError] = useState(false);

  const onError = () => {
    setHasError(true);
  };

  return (
    <Image
      source={hasError ? fallbackSource : source}
      onError={onError}
      {...props}
    />
  );
};

export default FallbackImage; 