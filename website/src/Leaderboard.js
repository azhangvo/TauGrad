import React, {Component} from "react";
import API from "./API";
import styles from "./css/Leaderboard.module.scss";

class Leaderboard extends Component {
    constructor(props) {
        super(props);
        this.state = {leaderboard: {}};
        API.getLeaderboard().then((leaderboard) => {
            console.log(leaderboard)
            this.setState({leaderboard});
        });
        API.waitUpdate(this);
    }

    render() {
        if (!this.state.leaderboard.div1 || !this.state.leaderboard.div2) {
            return <></>;
        }
        return (
            <div className={styles.container}>
                <div className={styles.flexCenter}>
                    <h1>Division 1</h1>
                    <table>
                        <tr>
                            <th>Team Name</th>
                            <th>Score</th>
                            <th>Time</th>
                        </tr>
                        {
                            (this.state.leaderboard.div1.map((team, index) => {
                                return (
                                    <tr>
                                        <td>{team.name}</td>
                                        <td>{team.score | "N/A"}</td>
                                        <td>{team.time ? (new Date(team.time).toISOString().slice(11,19)) : "N/A"}</td>
                                    </tr>
                                )
                            }))
                        }
                    </table>
                </div>
                <div className={styles.flexCenter}>
                    <h1>Division 2</h1>
                    <table>
                        <tr>
                            <th>Team Name</th>
                            <th>Score</th>
                            <th>Time</th>
                        </tr>
                        {
                            (this.state.leaderboard.div2.map((team, index) => {
                                return (
                                    <tr>
                                        <td>{team.name}</td>
                                        <td>{team.score | "N/A"}</td>
                                        <td>{team.time ? (new Date(team.time).toISOString().slice(11,19)) : "N/A"}</td>
                                    </tr>
                                )
                            }))
                        }
                    </table>
                </div>
            </div>
        )
    }
}

export default Leaderboard;