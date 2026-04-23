import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Simple Calculator',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const CalculatorPage(title: 'Simple Calculator'),
      debugShowCheckedModeBanner:false ,
    );
  }
}

class CalculatorPage extends StatefulWidget {
  const CalculatorPage({super.key, required this.title});

  final String title;

  @override
  State<CalculatorPage> createState() => _CalculatorPageState();
}

class _CalculatorPageState extends State<CalculatorPage> {
  // Controllers allows us to retrieve the text from the Input Fields
  final TextEditingController _num1Controller = TextEditingController();
  final TextEditingController _num2Controller = TextEditingController();

  String _result = "Result will appear here";

  // Function to perform the math
  void _calculate(String operation) {
    // 1. Get the text from the controllers
    String text1 = _num1Controller.text;
    String text2 = _num2Controller.text;

    // 2. Convert text to numbers (double)
    // double.tryParse is safer: it returns null if text is not a number
    double? num1 = double.tryParse(text1);
    double? num2 = double.tryParse(text2);

    // 3. Check for valid input
    if (num1 == null || num2 == null) {
      setState(() {
        _result = "Please enter valid numbers";
      });
      return;
    }

    // 4. Perform the operation
    double calcResult = 0.0;

    switch (operation) {
      case '+':
        calcResult = num1 + num2;
        break;
      case '-':
        calcResult = num1 - num2;
        break;
      case '*':
        calcResult = num1 * num2;
        break;
      case '/':
        if (num2 == 0) {
          setState(() {
            _result = "Cannot divide by zero";
          });
          return;
        }
        calcResult = num1 / num2;
        break;
    }

    // 5. Update the UI
    setState(() {
      // toStringAsFixed(2) rounds the result to 2 decimal places
      _result = "Result: ${calcResult.toStringAsFixed(2)}";
    });
  }

  @override
  void dispose() {
    // Always dispose controllers when the widget is removed to free memory
    _num1Controller.dispose();
    _num2Controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            // --- Input Field 1 ---
            TextField(
              controller: _num1Controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Enter First Number',
              ),
            ),
            const SizedBox(height: 20), // Spacing

            // --- Input Field 2 ---
            TextField(
              controller: _num2Controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Enter Second Number',
              ),
            ),
            const SizedBox(height: 30),

            // --- Operation Buttons ---
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () => _calculate('+'),
                  child: const Text("+"),
                ),
                ElevatedButton(
                  onPressed: () => _calculate('-'),
                  child: const Text("-"),
                ),
                ElevatedButton(
                  onPressed: () => _calculate('*'),
                  child: const Text("x"),
                ),
                ElevatedButton(
                  onPressed: () => _calculate('/'),
                  child: const Text("/"),
                ),
              ],
            ),
            const SizedBox(height: 30),

            // --- Result Display ---
            Text(
              _result,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.blueAccent,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),	
    );
  }
}

