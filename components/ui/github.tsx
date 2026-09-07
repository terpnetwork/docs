import { GithubInfo } from 'fumadocs-ui/components/github-info';

export function MyGithubInfo(owner: string, repo: string) {
    return (<GithubInfo owner={owner} repo={repo} />);
}