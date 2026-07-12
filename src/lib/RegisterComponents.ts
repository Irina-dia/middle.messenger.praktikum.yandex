import { registerComponent } from './RegisterComponent';

import { Button } from '../components/button';
import { Input } from '../components/input';
import { InputProfile } from '../components/input-profile';
import { Link } from '../components/link';
import { Title } from '../components/title';
import { Paragraph } from '../components/paragraph';
import { ChatItem } from '../components/chat-item';

export function registerComponents() {
    registerComponent(Button);
    registerComponent(Input);
    registerComponent(InputProfile);
    registerComponent(Link);
    registerComponent(Title);
    registerComponent(Paragraph);
    registerComponent(ChatItem);
}
