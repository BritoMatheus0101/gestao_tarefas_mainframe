document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const taskModal = document.getElementById('taskModal');
    const newTaskBtn = document.getElementById('newTaskBtn');
    const closeBtn = document.querySelector('.close-btn');
    const taskForm = document.getElementById('taskForm');
    const tasksTableBody = document.querySelector('#tasksTable tbody');
    const addScenarioBtn = document.getElementById('addScenarioBtn');
    const testScenariosContainer = document.getElementById('testScenariosContainer');
    const downloadBtn = document.getElementById('downloadBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadFile = document.getElementById('uploadFile');
    const searchInput = document.getElementById('searchInput');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentTaskId = 0;

    // Funções auxiliares
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const generateId = () => {
        if (tasks.length === 0) return 1;
        const lastTask = tasks[tasks.length - 1];
        return lastTask.id + 1;
    };

    const displayTasks = (filteredTasks = tasks) => {
        tasksTableBody.innerHTML = '';
        if (filteredTasks.length === 0) {
            tasksTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhuma tarefa cadastrada.</td></tr>';
            return;
        }

        filteredTasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.id}</td>
                <td>${task.historyNumber}</td>
                <td>${task.description}</td>
                <td>${task.status}</td>
                <td>${task.startDate}</td>
                <td>
                    <div class="action-btns">
                        <button onclick="viewTask(${task.id})">Consultar</button>
                        <button onclick="editTask(${task.id})">Atualizar</button>
                        <button class="delete-btn" onclick="deleteTask(${task.id})">Deletar</button>
                        <button onclick="downloadTaskText(${task.id})">TXT</button>
                    </div>
                </td>
            `;
            tasksTableBody.appendChild(row);
        });
    };

    const createScenarioInput = (value = '') => {
        const scenarioItem = document.createElement('div');
        scenarioItem.className = 'scenario-item';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'testScenarioInput';
        input.value = value;
        input.placeholder = `Cenário de Teste ${testScenariosContainer.children.length + 1}`;
        input.required = true;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-scenario-btn';
        deleteBtn.textContent = 'Deletar';
        deleteBtn.style.display = testScenariosContainer.children.length > 0 ? 'inline-block' : 'none';
        deleteBtn.addEventListener('click', () => {
            scenarioItem.remove();
            updateScenarioPlaceholders();
        });

        scenarioItem.appendChild(input);
        scenarioItem.appendChild(deleteBtn);
        return scenarioItem;
    };

    const updateScenarioPlaceholders = () => {
        Array.from(testScenariosContainer.children).forEach((child, index) => {
            child.querySelector('.testScenarioInput').placeholder = `Cenário de Teste ${index + 1}`;
            child.querySelector('.delete-scenario-btn').style.display = testScenariosContainer.children.length > 1 ? 'inline-block' : 'none';
        });
    };

    const clearForm = () => {
        taskForm.reset();
        document.getElementById('taskId').value = '';
        testScenariosContainer.innerHTML = '';
        testScenariosContainer.appendChild(createScenarioInput());
    };

    const showModal = () => {
        taskModal.style.display = 'block';
    };

    const hideModal = () => {
        taskModal.style.display = 'none';
        clearForm();
    };

    // Event Listeners
    newTaskBtn.addEventListener('click', () => {
        clearForm();
        showModal();
    });

    closeBtn.addEventListener('click', hideModal);

    window.onclick = (event) => {
        if (event.target === taskModal) {
            hideModal();
        }
    };

    addScenarioBtn.addEventListener('click', () => {
        testScenariosContainer.appendChild(createScenarioInput());
        updateScenarioPlaceholders();
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('taskId').value;
        const historyNumber = document.getElementById('historyNumber').value;
        const description = document.getElementById('taskDescription').value;
        const programs = document.getElementById('programs').value.split(',').map(p => p.trim()).filter(p => p);
        const mainPackage = document.getElementById('mainPackage').value;
        const contingencyPackage = document.getElementById('contingencyPackage').value;
        const mainTicket = document.getElementById('mainTicket').value;
        const contingencyTicket = document.getElementById('contingencyTicket').value;
        const books = document.getElementById('books').value.split(',').map(b => b.trim()).filter(b => b);
        const bookPackage = document.getElementById('bookPackage').value;
        const status = document.getElementById('taskStatus').value;
        const startDate = document.getElementById('taskStartDate').value;
        const testScenarios = Array.from(document.querySelectorAll('.testScenarioInput')).map(input => input.value.trim());

        const newTaskData = {
            id: id ? parseInt(id) : generateId(),
            historyNumber,
            description,
            programs,
            mainPackage,
            contingencyPackage,
            mainTicket,
            contingencyTicket,
            books,
            bookPackage,
            status,
            startDate,
            testScenarios,
        };

        if (id) {
            const taskIndex = tasks.findIndex(task => task.id === parseInt(id));
            if (taskIndex !== -1) {
                tasks[taskIndex] = newTaskData;
            }
        } else {
            tasks.push(newTaskData);
        }

        saveTasks();
        displayTasks();
        hideModal();
    });

    downloadBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "tarefas_mainframe_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    uploadBtn.addEventListener('click', () => {
        uploadFile.click();
    });

    uploadFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const uploadedTasks = JSON.parse(event.target.result);
                tasks = uploadedTasks;
                saveTasks();
                displayTasks();
                alert('Dados carregados com sucesso!');
            } catch (error) {
                alert('Erro ao carregar o arquivo. Por favor, verifique se é um arquivo JSON válido.');
            }
        };
        reader.readAsText(file);
    });

    window.filterTasks = () => {
        const query = searchInput.value.toLowerCase();
        const filtered = tasks.filter(task =>
            String(task.id).includes(query) ||
            task.description.toLowerCase().includes(query) ||
            String(task.historyNumber).includes(query)
        );
        displayTasks(filtered);
    };

    // Funções de Ação na Tabela
    window.viewTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const viewContent = `
            <h3>Detalhes da Tarefa #${task.id}</h3>
            <p><strong>Nº da História:</strong> ${task.historyNumber}</p>
            <p><strong>Descrição:</strong> ${task.description}</p>
            <p><strong>Programas:</strong> ${task.programs.join(', ') || 'N/A'}</p>
            <p><strong>Pacote Principal:</strong> ${task.mainPackage || 'N/A'}</p>
            <p><strong>Pacote Contingência:</strong> ${task.contingencyPackage || 'N/A'}</p>
            <p><strong>Ticket Principal:</strong> ${task.mainTicket || 'N/A'}</p>
            <p><strong>Ticket Contingência:</strong> ${task.contingencyTicket || 'N/A'}</p>
            <p><strong>Books:</strong> ${task.books.join(', ') || 'N/A'}</p>
            <p><strong>Pacote dos Books:</strong> ${task.bookPackage || 'N/A'}</p>
            <p><strong>Status:</strong> ${task.status}</p>
            <p><strong>Data de Início:</strong> ${task.startDate}</p>
            <h4>Cenários de Teste:</h4>
            <ul>
                ${task.testScenarios.map(scenario => `<li>${scenario}</li>`).join('')}
            </ul>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = viewContent;
        const modal = document.createElement('div');
        modal.className = 'modal';
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => modal.remove();
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(tempDiv);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        modal.style.display = 'block';
    };

    window.editTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        document.getElementById('taskId').value = task.id;
        document.getElementById('historyNumber').value = task.historyNumber;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('programs').value = task.programs.join(', ');
        document.getElementById('mainPackage').value = task.mainPackage;
        document.getElementById('contingencyPackage').value = task.contingencyPackage;
        document.getElementById('mainTicket').value = task.mainTicket;
        document.getElementById('contingencyTicket').value = task.contingencyTicket;
        document.getElementById('books').value = task.books.join(', ');
        document.getElementById('bookPackage').value = task.bookPackage;
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskStartDate').value = task.startDate;

        testScenariosContainer.innerHTML = '';
        task.testScenarios.forEach(scenario => {
            testScenariosContainer.appendChild(createScenarioInput(scenario));
        });
        updateScenarioPlaceholders();
        showModal();
    };

    window.deleteTask = (id) => {
        if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            displayTasks();
        }
    };

    window.downloadTaskText = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const textContent = `
Resumo da Tarefa Mainframe

Data da Geração: ${new Date().toLocaleDateString('pt-BR')}

--- Informações da Tarefa ---
Número da Tarefa: ${task.id}
Nº da História: ${task.historyNumber}
Descrição: ${task.description}
Status: ${task.status}
Data de Início: ${task.startDate}

--- Detalhes de Código e Pacotes ---
Programas: ${task.programs.join(', ') || 'N/A'}
Pacote Principal: ${task.mainPackage || 'N/A'}
Pacote Contingência: ${task.contingencyPackage || 'N/A'}
Ticket Principal: ${task.mainTicket || 'N/A'}
Ticket Contingência: ${task.contingencyTicket || 'N/A'}
Books: ${task.books.join(', ') || 'N/A'}
Pacote Associado aos Books: ${task.bookPackage || 'N/A'}

--- Cenários de Teste ---
${task.testScenarios.map((scenario, index) => `Cenário ${index + 1}: ${scenario}`).join('\n')}
        `;

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `tarefa_${task.id}_resumo.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Inicialização
    displayTasks();
});