import { StyleSheet, Text, View, Button, FlatList, TextInput, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView, SafeAreaProvider, } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';


export default function App() {
  type OstosItem = {
    ostos: string
  }

  type Purchase = {
    id: number;
    product: string;
    amount: string;
  };
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const db = SQLite.openDatabaseSync('purchasedb');

  const initialize = async () => {
    try {
      await db.execAsync(`
      CREATE TABLE IF NOT EXISTS purchase (id INTEGER PRIMARY KEY NOT NULL, product TEXT, amount TEXT);
    `);
      await handleFetch();
    } catch (error) {
      console.error('Could not open database', error);
    }
  }
  const handleSave = async () => {
    try {
      await db.runAsync('INSERT INTO purchase (product, amount) VALUES (?, ?)', product, amount);
      await handleFetch();
    } catch (error) {
      console.error('Could not add item', error);
    }
  };

  useEffect(() => { initialize() }, []);


  const handleFetch = async () => {
    try {
      const list = await db.getAllAsync('SELECT * from purchase');
      setPurchases(list as Purchase[]);
    } catch (error) {
      console.error('Could not get items', error);
    }
    setProduct("");
    setAmount("");
  }

  const handleDelete = async (id: number) => {
  try {
    await db.runAsync('DELETE FROM purchase WHERE id=?', id);
    await handleFetch();
  }
  catch (error) {
    console.error('Could not delete item', error);
  }
}

 

  return (
    <SafeAreaProvider>

      <SafeAreaView style={styles.container}>
        <TextInput style={styles.input}
          value={product}
          placeholder='Product'
          onChangeText={product => setProduct(product)}
        />
        <TextInput style={styles.input}
          value={amount}
          placeholder='Amount'
          onChangeText={amount => setAmount(amount)}
        />
        <View style={styles.buttons}>
          <Pressable onPress={handleSave} style={styles.button}>
            <Text style={styles.buttonText}>SAVE</Text>
          </Pressable>

        </View>
        <View>
          <Text style={styles.text}>Shopping list</Text>
        </View>
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={purchases} 
          renderItem={({ item }) =>
            <View style={styles.list}>
              <Text style={styles.text}>{item.product},</Text>
              <Text style={styles.text}>{item.amount}</Text>
              <Button onPress={() => handleDelete(item.id)} title="bought" />
            </View>
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: 300,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 8
  },
  buttons: {
    flexDirection: 'row',
    paddingTop: 20
  },
  button: {
    backgroundColor: 'blue',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white'
  },
  list: {
    flexDirection: 'row',
    paddingTop: 10
  }

});
