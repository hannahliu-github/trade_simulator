import React from 'react';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

import '../../styles/simulation/simulation.css';

class Simulation extends React.Component {
    constructor(props) {
        super(props)

        const initial_cash = this.props.simulation.initial_cash;
        const tickers = this.props.simulation.security_set.split('_');

        this.state = {
            account_value: initial_cash,
            portfolio: { cash: { units: initial_cash, price: 1, upDownPct: 0, market_value: initial_cash }, 'GOOGL': { units: 10, price: 1303.23, upDownPct: -0.0134, market_value: 13032.3}, 'AAPL': { units: 2, price: 305.50623234, upDownPct: 0.00932, market_value: 2 * 305.50623234}},
            portfolio_tickers: ['AAPL', 'GOOGL'],
            stock_tickers: tickers,
            simulation_id: this.props.simulation.id,
            simulation_time: this.props.simulation.start_time * 1000,
            // time series
            quote_times: [],
            account_values: [],
            stock_prices: {'AAPL': [300, 301, 302], 'GOOGL': [1305, 1302, 1303]} // Object.fromEntries(tickers.map(ticker => [ticker, []]))
        }

        // bind methods
        this.startSimulation = this.startSimulation.bind(this);
        this.pauseSimulation = this.pauseSimulation.bind(this);
        this.stopSimulation = this.stopSimulation.bind(this);
        this.requestTickUpdate = this.requestTickUpdate.bind(this);
        this.receiveTickUpdate = this.receiveTickUpdate.bind(this);
    }


    startSimulation() {
        console.log('Start simulation');

        // fake data for testing:
        this.receiveTickUpdate();
    }


    pauseSimulation() {
        console.log('Puse simulation...');
    }


    stopSimulation() {
        console.log('Stop simulation');
    }


    requestTickUpdate() {
        // send request for next tick
    }


    receiveTickUpdate() {
        // update simulation time, quotes and portfolio with data from new tick

        const newSimulationTime = this.state.simulation_time + 1000;
        const newAccountValue = this.state.account_value + (Math.random() - 0.5) * 10;

        this.setState({
            simulation_time: newSimulationTime,
            account_value: newAccountValue,
            quote_times: this.state.quote_times.concat(newSimulationTime),
            account_values: this.state.account_values.concat(newAccountValue)
        });
    }


    formatDollarAmount(num) {
        // Return num with comma separators and 2 decimal places.
        let numStr = Number(num.toFixed(2)).toLocaleString();

        // ensure 2 decimal places
        const parts = numStr.split('.');
        if (parts.length == 1) {
            numStr = numStr.concat('.00');
        }
        else if (parts[1].length == 1) {
            numStr = numStr.concat('0');
        }
        return numStr
    }


    formatTimestampAsString(timestamp) {
        // Return a string in format 'yyyy-mm-dd hh:mm:ss'
        const d = new Date(timestamp);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const monthStr = month < 10 ? '0'.concat(month) : String(month)
        const dayStr = day < 10 ? '0'.concat(day) : String(day);

        const datePart = String(d.getFullYear()) + '-' + monthStr + '-' + day;
        const timePart = d.toLocaleTimeString('en-UK');
        return datePart + ' ' + timePart;
    }


    componentDidMount() {

        // poftfolio chart

        const lineColor = this.state.account_value >= this.props.simulation.initial_cash ? '#198754' : '#dc3545';

        const portfolioChartData = [
            {
                x: this.state.quote_times.map(time => this.formatTimestampAsString(time)),
                y: this.state.account_values,
                type: "scatter",
                mode: "lines",
                line: { color: lineColor }
            }
        ];

        const portfolioChartLayout = {
            title: 'Account Value: $' + this.formatDollarAmount(this.state.account_value),
            titlefont: {
                family: 'American Typewriter, serif',
                color: '#ff6600'
            },
            bgcolor: 'red',
            paper_bgcolor: '#091020',
            plot_bgcolor: '#14171C',
            margin: {
                t: 60,
                r: 30,
                l: 60
            },
            separator: ',',
            showLegend: false,
            xaxis : {
                title: 'Time',
                titlefont: {
                    family: 'American Typewriter, serif',
                    color: '#91ABBD'
                },
                tickfont: { color: '#91ABBD' },
                tickcolor: '#91ABBD'
            },
            yaxis: {
                autotypenumbers: 'strict',
                minexponent: 9,
                titlefont: {
                    family: 'American Typewriter, serif'
                },
                tickfont: { color: '#91ABBD' },
                tickcolor: '#91ABBD',
                tickformat: "$,.0f"
            },
        };

        // can be put in state
        const portfolioChartConfig = {
            displayModeBar: false,
            scrollZoom: true,
        };

        //const plotElement = document.getElementById('portfolio-chart');
        Plotly.react('portfolio-chart', portfolioChartData, portfolioChartLayout, portfolioChartConfig);

    }

    componentDidUpdate() {
        this.componentDidMount();
    }

    render() {

        // up/down colors
        const upColor = '#198754'; // green
        const downColor = '#dc3545'; // red

        // portfolio table rows
        const portfolio_table_rows = this.state.portfolio_tickers.map(t => 
            <tr key={t}>
                <td style={{ textAlign: 'left' }}>{t}</td>
                <td style={{ textAlign: 'right', color: this.state.portfolio[t].upDownPct >= 0 ? upColor : downColor }}>
                    {(100 * this.state.portfolio[t].upDownPct).toFixed(2)}%</td>
                <td style={{ textAlign: 'right', color: this.state.portfolio[t].upDownPct >= 0 ? upColor : downColor }}>
                    {this.formatDollarAmount(this.state.portfolio[t].price)}</td>
                <td style={{ textAlign: 'center' }}>
                    {this.state.portfolio[t].units}</td>
                <td style={{ textAlign: 'right', color: '#ff6600'}}>
                    ${this.formatDollarAmount(this.state.portfolio[t].market_value)}</td>
            </tr>    
        );

        return (
            <Container>
                <Row> {/* Button Group and Time */}
                <Col>
                <ButtonGroup size="lg">
                    <Button
                        id="button-start"
                        variant="success"
                        onClick={this.startSimulation}
                    >Start <span className="fas fa-play" /></Button>

                    <Button
                        id="button-pause"
                        variant="warning"
                        onClick={this.pauseSimulation}
                    >Pause <span className="fas fa-pause" /></Button>

                    <Button
                        id="button-stop"
                        variant="danger"
                        onClick={this.stopSimulation}
                    >Stop <span className="fas fa-stop" /></Button>
                </ButtonGroup>
                </Col>
                <Col>
                <Row>
                    Simulation date: {new Date(this.state.simulation_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </Row>
                <Row className="time-row">
                    Time: {new Date(this.state.simulation_time).toLocaleTimeString()}
                </Row>
                </Col>
                </Row>
                <Row>
                <Col> {/* Portfolio Chart */}
                    <div id="portfolio-chart"></div>
                    <Row>
                        <p style={{textAlign: 'right', color: '#ff6600'}}>
                            Available cash: ${this.formatDollarAmount(this.state.portfolio.cash.market_value)}
                        </p>
                    </Row>     
                    <Table
                        id="portfolio-table"
                        responsive="true"
                    >
                        <thead>
                            <tr style={{ color: '#91ABBD'}}>
                                <th style={{ textAlign: 'left' }}>Ticker</th>
                                <th style={{ textAlign: 'right' }}>Change</th>
                                <th style={{ textAlign: 'right' }}>Price</th>
                                <th style={{ textAlign: 'center' }}>Shares</th>
                                <th style={{ textAlign: 'right' }}>Market Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolio_table_rows}
                        </tbody>

                    </Table>     
                </Col>
                <Col> {/* Stock List */}
                Stock List
                </Col>
                </Row>
            </Container>
        );
    }

}

export default Simulation;
