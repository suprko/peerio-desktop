const React = require('react');

module.exports.AppBar = require('react-toolbox/lib/app_bar/AppBar').default;
module.exports.Autocomplete = require('react-toolbox/lib/autocomplete/Autocomplete').default;
module.exports.Avatar = require('react-toolbox/lib/avatar/Avatar').default;
module.exports.Button = require('react-toolbox/lib/button/Button').default;
module.exports.BrowseButton = require('react-toolbox/lib/button/BrowseButton').default;
module.exports.IconButton = require('react-toolbox/lib/button/IconButton').default;
module.exports.Card = require('react-toolbox/lib/card/Card').default;
module.exports.CardActions = require('react-toolbox/lib/card/CardActions').default;
module.exports.CardMedia = require('react-toolbox/lib/card/CardMedia').default;
module.exports.CardText = require('react-toolbox/lib/card/CardText').default;
module.exports.CardTitle = require('react-toolbox/lib/card/CardTitle').default;
module.exports.Chip = require('react-toolbox/lib/chip/Chip').default;
module.exports.Checkbox = require('react-toolbox/lib/checkbox/Checkbox').default;
module.exports.DatePicker = require('react-toolbox/lib/date_picker/DatePicker').default;
module.exports.Dialog = require('react-toolbox/lib/dialog/Dialog').default;
module.exports.Drawer = require('react-toolbox/lib/drawer/Drawer').default;
module.exports.Dropdown = require('react-toolbox/lib/dropdown/Dropdown').default;
module.exports.FontIcon = require('react-toolbox/lib/font_icon/FontIcon').default;
module.exports.Input = require('react-toolbox/lib/input/Input').default;
module.exports.Layout = require('react-toolbox/lib/layout/Layout').default;
module.exports.NavDrawer = require('react-toolbox/lib/layout/NavDrawer').default;
module.exports.Panel = require('react-toolbox/lib/layout/Panel').default;
module.exports.Sidebar = require('react-toolbox/lib/layout/Sidebar').default;
module.exports.Link = require('react-toolbox/lib/link/Link').default;
module.exports.List = require('react-toolbox/lib/list/List').default;
module.exports.ListCheckbox = require('react-toolbox/lib/list/ListCheckbox').default;
module.exports.ListDivider = require('react-toolbox/lib/list/ListDivider').default;
module.exports.ListItem = require('react-toolbox/lib/list/ListItem').default;
module.exports.ListItemActions = require('react-toolbox/lib/list/ListItemActions').default;
module.exports.ListItemContent = require('react-toolbox/lib/list/ListItemContent').default;
module.exports.ListItemLayout = require('react-toolbox/lib/list/ListItemLayout').default;
module.exports.ListItemText = require('react-toolbox/lib/list/ListItemText').default;
module.exports.ListSubHeader = require('react-toolbox/lib/list/ListSubHeader').default;
module.exports.IconMenu = require('react-toolbox/lib/menu/IconMenu').default;
module.exports.Menu = require('react-toolbox/lib/menu/Menu').default;
module.exports.MenuDivider = require('react-toolbox/lib/menu/MenuDivider').default;
module.exports.MenuItem = require('react-toolbox/lib/menu/MenuItem').default;
module.exports.Navigation = require('react-toolbox/lib/navigation/Navigation').default;
module.exports.ProgressBar = require('react-toolbox/lib/progress_bar/ProgressBar').default;
module.exports.RadioButton = require('react-toolbox/lib/radio/RadioButton').default;
module.exports.RadioGroup = require('react-toolbox/lib/radio/RadioGroup').default;
module.exports.Ripple = require('react-toolbox/lib/ripple/Ripple').default;
module.exports.Slider = require('react-toolbox/lib/slider/Slider').default;
module.exports.Snackbar = require('react-toolbox/lib/snackbar/Snackbar').default;
module.exports.Switch = require('react-toolbox/lib/switch/Switch').default;
module.exports.Table = require('react-toolbox/lib/table/Table').default;
module.exports.Tab = require('react-toolbox/lib/tabs/Tab').default;
module.exports.Tabs = require('react-toolbox/lib/tabs/Tabs').default;
module.exports.Tooltip = require('react-toolbox/lib/tooltip/Tooltip').default;
module.exports.TimePicker = require('react-toolbox/lib/time_picker/TimePicker').default;

module.exports.TooltipIconButton = module.exports.Tooltip()(module.exports.IconButton);
module.exports.TooltipDiv = module.exports.Tooltip()(props =>
    React.createElement('div', {
        style: props.style,
        className: props.className,
        onMouseEnter: props.onMouseEnter,
        onMouseLeave: props.onMouseLeave
    }, props.children)
);
