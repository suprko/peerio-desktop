import React from 'react';
import ReactDOM from 'react-dom';
import {
    action,
    computed,
    observable,
    reaction,
    IReactionDisposer
} from 'mobx';
import { observer } from 'mobx-react';
import css from 'classnames';
import beaconStore from '~/stores/beacon-store';

const MARGIN_DEFAULT = 16; // same as $margin-default in SCSS

interface BeaconBaseProps {
    name: string;
}

export interface SpotBeaconProps extends BeaconBaseProps {
    type: 'spot';
    circleContent: any;
    position?: 'right' | 'left'; // position of the bubble
}

export interface AreaBeaconProps extends BeaconBaseProps {
    type: 'area';
    arrowPosition?: 'top' | 'right' | 'bottom' | 'left'; // position of the arrow on the rectangle
    arrowDistance?: number; // how far along the side of the rectangle to place the arrow, as a percentage
}

const appRoot: HTMLElement = document.getElementById('root');

interface RectanglePosition {
    top?: string;
    bottom?: string;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    paddingRight?: number;
    paddingLeft?: number;
}

@observer
export default class Beacon extends React.Component<
    SpotBeaconProps | AreaBeaconProps
> {
    @computed
    get active() {
        return beaconStore.currentBeacon.name === this.props.name;
    }

    // We make a lot of calculations based on child content size and position
    // `contentRef` stores the ref for the .beacon-container component which contains the child content
    @observable contentRef;
    @observable rendered = false;
    setContentRef = ref => {
        if (ref) {
            this.contentRef = ref;
            this.setContentRect();
        }
    };

    // `contentRect` stores the bounding rect for the child content.
    // We give it default values to start, to prevent null references
    @observable
    contentRect = {
        top: 0,
        left: 0,
        height: 0,
        width: 0
    };

    @action.bound
    setContentRect() {
        if (this.contentRef) {
            this.contentRect = this.contentRef.getBoundingClientRect();
        }
    }

    @observable dispose: IReactionDisposer;
    @observable renderTimeout: NodeJS.Timer;
    componentWillMount() {
        // Update `contentRect` on window resize
        window.addEventListener('resize', this.setContentRect);

        this.dispose = reaction(
            () => this.active && !!this.contentRef,
            active => {
                if (active) {
                    this.renderTimeout = setTimeout(() => {
                        this.rendered = true;
                    }, 1);
                } else {
                    this.rendered = false;
                }
            }
        );
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setContentRect);
        this.dispose();
        this.renderTimeout = null;
    }

    // The size of the SpotBeacon circle is the greater of the child content's width and height.
    // Circle size is calculated here (as opposed to in the SpotBeacon component) because it affects the positioning of the beacon rectangle.
    @computed
    get circleSize() {
        const { height, width } = this.contentRect;
        return height > width ? height + 8 : width + 8;
    }

    // Beacon's overall positioning
    @computed
    get beaconStyle() {
        const contentTop = this.contentRect.top;
        const contentLeft = this.contentRect.left;
        const contentHeight = this.contentRect.height;
        const contentWidth = this.contentRect.width;

        let top: number;
        let left: number;
        let marginSize: number;
        let size: number;

        if (this.props.type === 'spot') {
            size = this.circleSize;

            /*
                To center the SpotBeacon over the child content,
                first the entire beacon is oriented to the center of the child content,
                then it is negatively offset by 50% of the bubble's diameter.
            */
            top = contentTop + contentHeight / 2;
            left = contentLeft + contentWidth / 2;
            marginSize = -this.circleSize / 2;
        } else {
            /*
                AreaBeacon anchor changes based on the arrow position.
                It will always be the edge of child content along one axis and the centered on the other axis.
                e.g. right arrow => anchor is centered along left edge of content
            */
            switch (this.props.arrowPosition) {
                case 'top':
                    top = contentTop + contentHeight;
                    left = contentLeft + contentWidth / 2;
                    break;
                case 'right':
                    top = contentTop + contentHeight / 2;
                    left = contentLeft;
                    break;
                case 'bottom':
                default:
                    top = contentTop;
                    left = contentLeft + contentWidth / 2;
                    break;
                case 'left':
                    top = contentTop + contentHeight / 2;
                    left = contentLeft + contentWidth;
                    break;
            }
        }

        return {
            height: size,
            width: size,

            top: top,
            left: left,

            marginTop: marginSize,
            marginLeft: marginSize
        };
    }

    // The bubble's vertical position is determined by the beacon's position in the window.
    // The window is divided into 5 horizontal "slices", each corresponding to a bubble position.
    @computed
    get slicePosition() {
        const sliceHeight = window.innerHeight / 5;
        return Math.floor(this.contentRect.top / sliceHeight) + 1;
    }

    // Position and 'slice' classes get repeated for the beacon itself, and the .rectangle and .circle divs
    // This is redundant, but helps keep the styles more organized
    @computed
    get positionClasses(): string {
        return this.props.type === 'spot'
            ? `${this.props.position || 'left'} slice-${this.slicePosition}`
            : this.props.arrowPosition || 'bottom';
    }

    /*
        Rectangle's positioning
        This is one of the trickier calculations, in part because it's completely different for Area and Spot Beacons
    */
    @observable
    rectangleRef: React.RefObject<HTMLDivElement> = React.createRef();

    @computed
    get rectanglePosition(): RectanglePosition | null {
        const ret = {} as RectanglePosition;

        let rectHeight, rectWidth;
        if (this.rectangleRef && this.rectangleRef.current) {
            const rectangle = this.rectangleRef.current.getBoundingClientRect();
            rectHeight = rectangle.height;
            rectWidth = rectangle.width;
        }

        /*
            For SpotBeacon, rectangle needs to be positioned very precisely based on own size and circle size.
            There's a lot of offsets based on half of the rectangle height, or half the circle diameter.
        */
        if (this.props.type === 'spot') {
            const rectangleOffset = rectHeight / 2;
            const circleOffset = this.circleSize / 2;

            switch (this.slicePosition) {
                case 1:
                    ret.top = '0';
                    ret.marginTop = circleOffset;
                    break;
                case 2:
                    ret.top = '0';
                    break;
                case 3:
                default:
                    ret.top = '50%';
                    ret.marginTop = -rectangleOffset;
                    break;
                case 4:
                    ret.bottom = '0';
                    break;
                case 5:
                    ret.bottom = '0';
                    ret.marginBottom = circleOffset;
                    break;
            }

            if (this.props.position === 'right') {
                ret.paddingRight = circleOffset;
                ret.marginRight = -circleOffset;
            } else {
                ret.paddingLeft = circleOffset;
                ret.marginLeft = -circleOffset;
            }
        } else {
            const arrowPos = this.props.arrowPosition;
            const xAxis = arrowPos === 'top' || arrowPos === 'bottom';
            const yAxis = arrowPos === 'left' || arrowPos === 'right';

            switch (arrowPos) {
                case 'top':
                    break;
                case 'right':
                    break;
                case 'bottom':
                default:
                    ret.bottom = '0';
                    break;
                case 'left':
                    break;
            }
        }

        return ret;
    }

    // `narrow` class added when rectangle height is less than two lines of text
    // (currently a hardcoded pixel value hardcoded)
    @computed
    get isNarrow() {
        if (!this.rectangleRef || !this.rectangleRef.current) return null;
        return this.rectangleRef.current.getBoundingClientRect().height < 72;
    }

    @action.bound
    beaconClick() {
        this.rendered = false;

        this.renderTimeout = setTimeout(() => {
            // If incrementing beaconNumber will go past length of current beaconFlow array, current beacon flow is done
            if (
                beaconStore.beaconNumber + 2 >
                beaconStore.beaconFlows[beaconStore.currentBeaconFlow].length
            ) {
                // // Reset beacon flow
                // beaconStore.beaconNumber = -1;
                // beaconStore.currentBeaconFlow = '';
                beaconStore.beaconNumber = 0;
            } else {
                beaconStore.beaconNumber += 1;
            }
        }, 250);
    }

    // Render the child content, wrapped in .beacon-container div so we can make the above positioning calculations
    childContent = (
        <div
            key="beacon-container"
            className="beacon-container"
            ref={this.setContentRef}
        >
            {this.props.children}
        </div>
    );

    beaconContent() {
        const { currentBeacon } = beaconStore;
        return (
            <div
                key="beacon-content"
                className={css(
                    'beacon',
                    `${this.props.type}-beacon`,
                    this.positionClasses,
                    {
                        show: this.rendered
                    }
                )}
                onClick={this.beaconClick}
                style={this.beaconStyle}
            >
                <div
                    ref={this.rectangleRef}
                    className={css('rectangle', this.positionClasses, {
                        narrow: this.isNarrow
                    })}
                    style={this.rectanglePosition}
                >
                    <div className="rectangle-content">
                        {currentBeacon.header ? (
                            <div className="header">{currentBeacon.header}</div>
                        ) : null}
                        {currentBeacon.body}
                    </div>
                </div>

                {this.props.type === 'spot' ? (
                    <Bubble
                        position={this.positionClasses}
                        size={this.circleSize}
                        content={this.props.circleContent}
                    />
                ) : (
                    <Arrow position={this.positionClasses} />
                )}
            </div>
        );
    }

    render() {
        if (!this.active && !this.rendered) return this.childContent;

        const beaconContent = this.beaconContent();

        return [
            this.childContent,
            ReactDOM.createPortal(beaconContent, appRoot)
        ];
    }
}

interface ArrowProps {
    classNames?: string;
    position: string;
}

@observer
class Arrow extends React.Component<ArrowProps> {
    render() {
        return (
            <div
                className={css(
                    'arrow',
                    this.props.classNames,
                    this.props.position
                )}
            />
        );
    }
}

interface BubbleProps {
    classNames?: string;
    position: string;
    size: number;
    content: any;
}

@observer
class Bubble extends React.Component<BubbleProps> {
    render() {
        return (
            <div
                className={css(
                    'circle',
                    this.props.classNames,
                    this.props.position
                )}
                style={{
                    height: this.props.size,
                    width: this.props.size
                }}
            >
                <div className="circle-content">{this.props.content}</div>
            </div>
        );
    }
}
