import React, {Component} from "react";
import API from "./API";
import styles from "./css/Leaderboard.module.scss";

class Leaderboard extends Component {
    constructor(props) {
        super(props);
        this.state = {leaderboard: []};
        API.getProblems().then((problems) => {
            this.setState({problems});
        });
        API.getLeaderboard().then((leaderboard) => {
            this.setState({leaderboard});
        });
        API.waitUpdate(this);
    }

    render() {
        if (!this.state.leaderboard) {
            return <></>;
        }
        return (
            <div className={styles.container}>
                <h1>Leaderboard</h1>
                <div className={styles.flexCenter}>
                    <table>
                        <tr>
                            <th>Team Name</th>
                            <th>Score</th>
                            <th>Time</th>
                        </tr>
                        {
                            (this.state.leaderboard.map((team, index) => {
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