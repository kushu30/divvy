import {
    Alert,
    Button,
    FlatList,
    SafeAreaView,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    useEffect,
    useState,
} from "react";

import { supabase } from "../lib/supabase";

type Props = {
    groupId: string;
    groupName: string;
    onBack: () => void;
};

type Member = {
    user_id: string;
    profiles: {
        email: string;
    }[];
};

export default function GroupScreen({
    groupId,
    groupName,
    onBack,
}: Props) {
    const [members, setMembers] = useState<
        Member[]
    >([]);

    const [email, setEmail] = useState("");

    async function fetchMembers() {
        const { data, error } =
            await supabase
                .from("group_members")
                .select(`
          user_id,
          profiles (
            email
          )
        `)
                .eq("group_id", groupId);

        if (!error && data) {
            setMembers(data as Member[]);
        }
    }

    async function handleAddMember() {
        try {
            const {
                data: profile,
                error,
            } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", email)
                .single();

            if (error || !profile) {
                Alert.alert(
                    "User not found"
                );

                return;
            }

            const {
                error: memberError,
            } = await supabase
                .from("group_members")
                .insert([
                    {
                        group_id: groupId,
                        user_id: profile.id,
                    },
                ]);

            if (memberError) {
                Alert.alert(
                    memberError.message
                );

                return;
            }

            Alert.alert("Member added");

            setEmail("");

            fetchMembers();
        } catch (error) {
            Alert.alert(
                "Something went wrong"
            );
        }
    }

    useEffect(() => {
        fetchMembers();
    }, []);

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "black",
                padding: 24,
                paddingTop: 60,
            }}
        >
            <View
                style={{
                    marginBottom: 24,
                }}
            >
                <Button
                    title="Back"
                    onPress={onBack}
                />
            </View>

            <Text
                style={{
                    color: "white",
                    fontSize: 28,
                    fontWeight: "bold",
                    marginBottom: 24,
                }}
            >
                {groupName}
            </Text>

            <TextInput
                placeholder="friend@email.com"
                placeholderTextColor="gray"
                value={email}
                onChangeText={setEmail}
                style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 16,
                    color: "white",
                }}
            />

            <Button
                title="Add Member"
                onPress={handleAddMember}
            />

            <View
                style={{
                    marginTop: 32,
                }}
            >
                <Text
                    style={{
                        color: "white",
                        fontSize: 20,
                        fontWeight: "bold",
                        marginBottom: 12,
                    }}
                >
                    Members
                </Text>

                <FlatList
                    data={members}
                    keyExtractor={(item) =>
                        item.user_id
                    }
                    renderItem={({ item }) => (
                        <Text
                            style={{
                                color: "white",
                                marginBottom: 8,
                            }}
                        >
                            {
                                item.profiles?.[0]?.email
                            }
                        </Text>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}