import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import GestureRecognizer from 'react-native-swipe-gestures';
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { tokenApi } from "../../conf.json";
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { RotateInDownLeft } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';



const Item = ({ item, onPress, backgroundColor, textColor }) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
        <Text style={[styles.title, { color: textColor }]}>{item.username}</Text>
    </TouchableOpacity>
);

export default function Contact() {
    const router = useRouter();
    const token = SecureStore.getItem('token');
    const [reload, setReload] = useState(false);
    const [Users, setUsers] = useState([]);
    const [selectedId, setSelectedId] = useState();
    const [ForU, setForU] = useState(true)
    const [AorD, setAorD] = useState(true)
    const [back, setback] = useState('')
    const [add, setadd] = useState('')
    const [del, setdel] = useState('')
    const colorScheme = useColorScheme();

    const reloadPage = () => {
        if (reload) {
            setReload(false);
        } else {
            setReload(true)
        }
        setback('')
    }

    const changeAorD = () => {
        if (AorD) {
            setAorD(false)
        } else {
            setAorD(true)
        }
    }

    const getUsers = async () => {
        setForU(false);
        await fetch('https://snapchat.epidoc.eu/user/',
            {
                method: 'GET',
                headers:
                {
                    Authorization:
                        'Bearer ' + token,
                    'X-API-Key': tokenApi,
                }
            }
        ).then(
            (res) => {
                res.json().then((data) => { let arr = data.data; setUsers(arr) })
            }
        )
        setback(
            <TouchableOpacity style={styles.button} onPress={() => reloadPage()}>
                <TabBarIcon name={'arrow-back'} color={'black'} style={styles.title} />
            </TouchableOpacity>
        )
    }

    const addFriend = async (id) => {
        await fetch('https://snapchat.epidoc.eu/user/friends',
            {
                method: 'POST',
                headers:
                {
                    Authorization:
                        'Bearer ' + token,
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-Key': tokenApi,
                },
                body: JSON.stringify({
                    "friendId": id
                })
            }
        ).then(
            (res) => {
                res.json().then((data) => { reloadPage() })
            }
        )
    }

    const removeFriend = async (id) => {
        await fetch('https://snapchat.epidoc.eu/user/friends',
            {
                method: 'DELETE',
                headers:
                {
                    Authorization:
                        'Bearer ' + token,
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-Key': tokenApi
                },
                body: JSON.stringify({
                    "friendId": id
                })
            }
        ).then(
            (res) => {
                res.json().then((data) => { reloadPage() })
            }
        )
    }

    const renderItem = ({ item }) => {
        if (AorD) {
            const backgroundColor = item._id === selectedId ? '#6e3b6e' : '#f9c2ff';
            const color = item._id === selectedId ? 'white' : 'black';

            return (
                <Item
                    item={item}
                    onPress={() => addFriend(item._id)}
                    backgroundColor={backgroundColor}
                    textColor={color}
                />
            );
        } else {
            const backgroundColor = 'red';
            const color = 'white';

            return (
                <Item
                    item={item}
                    onPress={() => { removeFriend(item._id); changeAorD() }}
                    backgroundColor={backgroundColor}
                    textColor={color}
                />
            );
        }
    };

    useEffect(() => {
        setForU(true);
        setadd(
            <TouchableOpacity style={styles.button} onPress={() => getUsers()}>
                <TabBarIcon name={'person-add'} color={'black'} style={styles.title} />
            </TouchableOpacity>
        );
        setdel(
            <TouchableOpacity style={styles.button} onPress={() => { changeAorD(); reloadPage() }}>
                <TabBarIcon name={'person-remove'} color={'black'} style={styles.title} />
            </TouchableOpacity>
        );
        async function fetchUsers() {
            await fetch('https://snapchat.epidoc.eu/user/friends',
                {
                    method: 'GET',
                    headers:
                    {
                        Authorization:
                            'Bearer ' + token,
                        'X-API-Key': tokenApi
                    }
                }
            ).then(
                (res) => {
                    res.json().then((data) => { let arr = data.data; setUsers(arr) })
                }
            )
        }
        fetchUsers()
    }, [reload])

    if (!ForU) {
        return (
            <View
                style={styles.Container}
            >
                <FlatList
                    data={Users}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    style={{ marginTop: 50 }}
                />
                <View style={styles.buttonContainer}>
                    {back}
                </View>
            </View>
        )
    }

    return (
        <GestureRecognizer
            onSwipeLeft={() => { router.replace('/profil') }}
            onSwipeRight={() => { router.replace('/(tabs)') }}
            style={styles.Container}
        >
            <FlatList
                data={Users}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                style={{ marginTop: 60}}
            />
            <View style={styles.buttonContainer}>
                {add}
                {del}
            </View>
        </GestureRecognizer>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        backgroundColor: '#f9c2ff',
        width: 400,
        padding: 5,
        marginVertical: 1,
    },
    buttonContainer: {
        height: 65,
        width: '100%' ,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    button: {
        width: 70,
        height: 70,
        backgroundColor: '#FFC0CB88',
        borderRadius: 100,
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        textAlign: 'center'
    },
});
