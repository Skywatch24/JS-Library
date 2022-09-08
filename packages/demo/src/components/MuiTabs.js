import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import {AppBar, Toolbar, Tabs, Tab} from '@material-ui/core';
import {Title} from './Title';

const useStyles = makeStyles(theme => ({
  toolbar: {paddingLeft: '24px'},
}));

const MuiTabs = ({tabs, selectedTabIndex, onSelectedTabChanged}) => {
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState({});

  useEffect(() => {
    if (selectedTabIndex < Object.keys(tabs).length) {
      setSelectedTab(Object.values(tabs)[selectedTabIndex]);
    }
  }, [tabs, selectedTabIndex]);

  const renderTabs = () => {
    return Object.entries(tabs).map(([key, tab]) => {
      return (
        <Tab
          key={key}
          label={tab.index + 1 + '. ' + tab.name}
          {...a11yProps(tab.index)}
        />
      );
    });
  };

  const a11yProps = index => {
    return {
      id: `scrollable-auto-tab-${index}`,
      'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
  };

  return (
    <AppBar position="fixed">
      <Toolbar className={classes.toolbar}>
        <Title>{selectedTab.title}</Title>
      </Toolbar>
      <Tabs
        value={selectedTabIndex}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="tabs"
        onChange={(e, key) => onSelectedTabChanged(key)}>
        {renderTabs()}
      </Tabs>
    </AppBar>
  );
};

MuiTabs.defaultProps = {
  tabs: {},
  selectedTabIndex: {},
  onSelectedTabChanged: () => {},
};

MuiTabs.propTypes = {
  tabs: PropTypes.object.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  onSelectedTabChanged: PropTypes.func.isRequired,
};

export {MuiTabs};
